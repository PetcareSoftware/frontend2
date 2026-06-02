export class ValidationError extends Error {
  name = 'ValidationError';

  constructor(message, code, options) {
    super(message, options);
    this.code = code;
  }
}

export const NEG_NAME_REGEXP = /[\d.,:;!#@$%&'"*+/=\\?^_`()[\]{|}<>~-]/;
export const DATE_REGEXP = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_REGEXP = /^\d{1,2}:\d{1,2}$/;
export const EMAIL_SIMPLE_REGEXP = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+$/;

export { equalsByProperties } from '@/lib/utils';
