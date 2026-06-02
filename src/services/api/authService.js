import axios from 'axios';
import {
  loadFromStorage, saveToStorage, bcChannelPost, bcChannelListen, b64UrlToB64
} from '@/lib/utils';

const FIXED_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

const nullStorage = {
  getItem() { return null; },
  setItem() { return; },
}

export class AuthenticationService {

  static AuthServiceError = class AuthServiceError extends Error {
    name = 'AuthServiceError';

    constructor(message, code) {
      super(message);
      this.code = code;
    }
  }

  constructor({
    tokenNames = { access: '', refresh: '' },
    storageType = 'private',
    axios,
    urls = { auth: '', refresh: '' },
    broadcastToken = true,
    expirationConfig = { lead: 0, minWaiting: 0 },
  }) {
    const defaultTokenNames = { access: 'petcare_access_token_v1', refresh: 'petcare_refresh_token_v1' };
    const defaultUrls = { auth: '/api/v1/token/', refresh: '/api/v1/token/refresh/' };
    const defaultExpirationConfig = { lead: 180000, minWaiting: 60000 };

    this.setDefaultClient(axios);
    this.tokenNames = { ...defaultTokenNames, ...tokenNames };
    this.urls = { ...defaultUrls, ...urls };
    this.storageType = storageType;
    this.broadcastToken = !!window.BroadcastChannel && broadcastToken;
    this.expirationConfig = { ...defaultExpirationConfig, ...expirationConfig };

    this._tokens = { access: null, refresh: null };
    this._retrying = false;
    this._bcChannels = {};
    this._interceptorRefs = [];
    this._expirationHandlers = { access: null, refresh: null };

    this._listenTokenBroadcast();
  }

  setDefaultClient(customAxios) {
    this.axios = customAxios || axios.create();
    return this.axios;
  }

  _generateConfig(config) {
    return { ...FIXED_CONFIG, ...config };
  }

  connectTo(axios) {
    const requestRef = axios.interceptors.request.use(...this.getRequestInterceptors(axios));
    const responseRef = axios.interceptors.response.use(...this.getResponseInterceptors(axios));
    this._interceptorRefs.push(axios, requestRef, responseRef);
  }

  authenticate = async (credentials) => {
    if (!credentials) {
      throw new TypeError("Tiene que darse las credenciales");
    }

    let tokens, user;
    try {
      tokens = await this.axios.post(this.urls.auth, credentials);
      tokens = tokens.data;

      if (tokens.user) {
        user = tokens.user;
        delete tokens.user;
      }

      tokens = this.readTokens(tokens);
    } catch (e) {
      if (e.status === 401) {
        const newError = new this.constructor.AuthServiceError(
          'Credenciales inválidas', 'unauthenticated'
        );
        newError.cause = e;
        e = newError;  // eslint-disable-line no-ex-assign
      }
      throw e;
    }

    this._saveAccessRefresh(tokens, false);
    return user || true;
  }

  deleteToken(type = 'access', { broadcast = true }) {
    this._saveToken(null, type, { allowDelete: true });
    if (broadcast) {
      this._sendDeleteBroadcast(type);
    }
  }

  destroy = () => {
    for (const channel in this._bcChannels) {
      this._bcChannels[channel].close();
      this._bcChannels[channel] = null;
    }

    let i = 0, axios;
    while (i < this._interceptorRefs.length) {
      axios = this._interceptorRefs[i++];
      axios.interceptors.request.eject(this._interceptorRefs[i++]);
      axios.interceptors.response.eject(this._interceptorRefs[i++]);
    }
    this._interceptorRefs = [];

    for (const handler in this._expirationHandlers) {
      if (this._expirationHandlers[handler] != null) {
        clearTimeout(this._expirationHandlers[handler]);
        this._expirationHandlers[handler] = null;
      }
    }
  }

  getRequestInterceptors(axios) {
    return this._requestInterceptors;
  }

  getResponseInterceptors(axios) {
    return [this._responseInterceptors[0],
      async (error) => {
        if (error.status === 401) {
          const authHeader = error.response?.headers?.['www-authenticate'];
          if (!authHeader || !authHeader.startsWith('Bearer')) {
            throw error;
          }

          if (!this._retrying) {
            this._retrying = true;
            this.deleteToken('access');
            return axios.request(error.config);
          } else {
            this._retrying = false;
            const newError = new this.constructor.AuthServiceError(
              'Requiere autenticación', 'unauthenticated'
            );
            newError.cause = error;
            throw newError;
          }
        } else {
          this._retrying = false;
        }

        throw error;
      },
    ];
  }

  _requestInterceptors = [
    async (config) => {
      let token = this._getToken();
      if (token.then) {
        token = await token;
      }

      config.headers.authorization = `Bearer ${token}`;
      return config;
    },
    undefined,
  ];

  _responseInterceptors = [
    async (response) => {
      if (response.status !== 401) {
        this._retrying = false;
      }
      return response;
    },
    undefined,
  ];

  _getToken(type = 'access') {
    const storage = this._getStorage();
    let token;

    if (type === 'access') {
      if (this._tokens.access) {
        return this._tokens.access;
      }
      this._tokens.access = token = loadFromStorage(this.tokenNames.access, storage);
    } else if (type === 'refresh') {
      if (this._tokens.refresh) {
        return this._tokens.refresh;
      }
      this._tokens.refresh = token = loadFromStorage(this.tokenNames.refresh, storage);
    } else {
      throw new this.constructor.AuthServiceError(`Tipo de token desconocido: ${type}`, 'unknownToken');
    }

    if (!token) {
      return this._getTokenFromServer(type);
    }

    this._refreshOnExpiration(token, type);
    this.sendTokenBroadcast(type);
    return token;
  };

  _getTokenFromServer(type) {
    let promise;

    if (type === 'access') {
      const refresh = this._getToken('refresh');
      promise = this._requestToken(type, { refresh }).then(
        this._saveAccessRefresh
      ).then(({ access }) => {
        this._refreshOnExpiration(access, 'access');
        this.sendTokenBroadcast('all');
        return access;
      });
    } else {
      promise = Promise.reject(new Error(`No se pudo encontrar este token: ${type}`));
    }

    return promise.catch(e => {
      const newError = new this.constructor.AuthServiceError('Requiere autenticación', 'unauthenticated');
      newError.cause = e;
      return Promise.reject(newError);
    });
  }

  _saveToken(token, type = 'access', { allowDelete = false, fromGetter = false }) {
    if (!allowDelete) {
      if (!token) return;

      if (!(token.value != null && (token.expiration == null || typeof token.expiration === 'number') )) {
        throw new TypeError('Formato de token inválido. Debe ser { value: not_null, expiration?: number }');
      }
    }

    const storage = this._getStorage();

    if (type === 'access') {
      this._tokens.access = token;
      saveToStorage(this.tokenNames.access, token, storage);
    } else if (type === 'refresh') {
      this._tokens.refresh = token;
      saveToStorage(this.tokenNames.refresh, token, storage);
    } else {
      throw new this.constructor.AuthServiceError(`Tipo de token desconocido: ${type}`, 'unknownToken');
    }

    if (!fromGetter) {
      this._refreshOnExpiration(token, type);
      this.sendTokenBroadcast(type);
    }
  }

  _saveAccessRefresh = ({ access, refresh }, fromGetter = true) => {
    if (access) this._saveToken(access, 'access', { fromGetter });
    if (refresh) this._saveToken(refresh, 'refresh', { fromGetter });
    return { access, refresh };
  }

  _getStorage() {
    const storageMap = {
      session: sessionStorage,
      local: localStorage,
      private: nullStorage,
    };
    const storage = storageMap[this.storageType];
    if (!storage) {
      throw new this.constructor.AuthServiceError(
        `Almacenamiento de claves no disponible: ${this.storageType}`, 'noStorage');
    }

    return storage;
  }

  getJWTField(jwt, section, name = undefined) {
    let decoded;
    const sections = jwt.split(".");

    if (section === 'header') {
      decoded = sections[0];
    } else if (section === 'claims') {
      decoded = sections[1];
    } else if (section === 'signature') {
      decoded = sections[2];
    }
    if (!decoded) return null;

    decoded = b64UrlToB64(decoded);

    try {
      decoded = atob(decoded);
      if (section === 'signature') {
        return decoded;
      }
      decoded = JSON.parse(decoded);
    } catch (e) {
      if (e instanceof SyntaxError) {
        return null;
      }
      throw e;
    }

    return name ? decoded?.[name] : decoded;
  }

  readTokens(tokens) {
    if (typeof tokens === 'string') {
      tokens = { access: { value: tokens } };
    }
    else if (typeof tokens === 'object' && !Array.isArray(tokens)) {
      for (const token in tokens) {
        tokens[token] = this.readJWT(tokens[token]);
      }
    } else {
      throw new this.constructor.AuthServiceError(
        'Formato de tokens desconocido', 'unknownTokenFormat'
      );
    }

    return tokens;
  }

  readJWT(token) {
    token = { value: token };

    try {
      const expiration = this.getJWTField(token.value, 'claims', 'exp');
      if (expiration) {
        token.expiration = expiration * 1000;
      }
    } catch {}  // eslint-disable-line no-empty

    return token;
  }

  async _requestToken(type, credentials) {
    if (type === 'access') {
      const response = await this.axios.post(this.urls.refresh, { refresh: credentials.refresh });
      return this.readTokens(response.data)['access'];
    } else {
      throw new Error(`No se puede solicitar este token: ${type}`);
    }
  }

  _refreshOnExpiration(token, type) {
    if (type !== 'access') {
      return;
    }

    const expiration = token.expiration;
    if (expiration == null) return;

    let waiting = expiration - Date.now() - this.expirationConfig.lead;
    if (waiting < this.expirationConfig.minWaiting) return;

    this._expirationHandlers[type] = setTimeout(() => {
      this._getTokenFromServer(type);
    }, waiting);
  }

  sendTokenBroadcast(type = 'all') {
    if (!this.broadcastToken || !type) return;

    const access = (type === 'access' || type === 'all') && this._tokens.access;
    const refresh = (type === 'refresh' || type === 'all') && this._tokens.refresh;

    bcChannelPost(this.tokenNames.access, {
      ...(access && { access }),
      ...(refresh && { refresh }),
    });
  }

  _listenTokenBroadcast() {
    if (!this.broadcastToken) return;

    this._bcChannels.token = bcChannelListen(this.tokenNames.access, this._saveAccessRefresh);
  }

  _sendDeleteBroadcast(type) {
    if (!this.broadcastToken) return;

    bcChannelPost(this.tokenNames.access + '_delete', { deleteType: type });
  }

  _listenDeleteBroadcast() {
    if (!this.broadcastToken) return;

    this._bcChannels.delete = bcChannelListen(this.tokenNames.access + '_delete', ({ deleteType }) => {
      if (deleteType) {
        this.deleteToken(deleteType, { broadcast: false });
      }
    });
  }
}
