// Colecciones

export function findReplace(obj, test, newValue) {
  if (Array.isArray(obj)) {
    const i = obj.findIndex(test);
    if (i >= 0) {
      obj[i] = newValue;
    }
    return i;
  }

  for (const key in obj) {
    if (test(obj)) {
      obj[key] = newValue;
      return key;
    }
  }
}

export function equalsByProperties(first, second, props, mode = 'and') {
  if (!props) return true;
  if (!first || !second) return false;

  const reducer = (mode === 'and' ? props.every : props.some).bind(props);
  return reducer(key => first[key] === second[key]);
}


// Fechas

export function shiftDate(dateStr, fromDate = getTodayDate() + 'T12:00:00') {
  if (!dateStr) return dateStr;

  const base = new Date(fromDate).getTime();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = today.getTime() - base;

  const d = new Date(dateStr + 'T12:00:00');
  d.setTime(d.getTime() + diff);
  return d.toISOString().slice(0, 10);
}

export function daysFromNow(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getTodayDate() {
  return daysFromNow(0);
}

export const getTodayShortDate = getTodayDate;


// Almacenamiento

export function loadFromStorage(name, storage = localStorage) {
  try {
    let obj = storage.getItem(name);
    obj = JSON.parse(obj);
    return obj || null;
  } catch(e) {
    if (e instanceof SyntaxError) {
      return null;
    }
    throw e;
  }
}

export function saveToStorage(name, obj, storage = localStorage) {
  storage.setItem(name, JSON.stringify(obj));
}


// Comunicación

export function bcChannelPost(channelName, message) {
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage(message);
    channel.close();
    return true;
  } else {
    return false;
  }
}

export function bcChannelListen(channelName, handler) {
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel(channelName);
    if (handler) {
      channel.addEventListener("message", handler);
    }
    return channel;
  }
}


// Conversión

export function b64UrlToB64(str) {
  str = str.replace(/[-_]/g, (c) => ( {"-": "+", "_": "/"}[c] ));
  if (str.length % 4 !== 0) {
    str += "=".repeat(4 - str.length % 4);
  }
  return str;
}
