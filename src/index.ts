import kebabCase from 'lodash.kebabcase';
import safeJsonStringify from 'safe-json-stringify';

const DEFAULT_ERROR_MESSAGE = 'Unknown Error';
const DEFAULT_ERROR_CODE = 'unknown-error';

export interface BaseErrorParams {
  code?: string;
  [k: string]: any; // tslint:disable-line:no-any
}

export default class BaseError extends Error {
  readonly code: string = '';
  readonly message: string;
  readonly name: string;
  readonly details: object;

  // FIXME: Following code doesn't pass linting because of bug in the typescript-eslint-parser package
  // constructor (params?: BaseErrorParams)
  // constructor (message: string, params?: BaseErrorParams)
  constructor (messageOrParams?: string | BaseErrorParams, params: BaseErrorParams = {}) {
    super();

    let message;
    if (typeof messageOrParams === 'string') {
      message = messageOrParams;
    } else {
      params = messageOrParams || {};
    }

    const { code, ...details } = params;

    this.name = this.constructor.name;
    this.code = code || this.code || kebabCase(this.name);
    this.message = message || (this.constructor as { defaultMessage?: string }).defaultMessage || '';
    this.details = safeJsonStringify.ensureProperties(details);

    Error.captureStackTrace(this, this.constructor);
  }

  static from (error: any): BaseError { // tslint:disable-line:no-any
    if (error instanceof BaseError) {
      return error;
    }

    // Map regular error to base error...
    if (error && typeof error === 'object' && typeof error.message === 'string' && typeof error.stack === 'string') {
      let baseErrorDetails: { [k: string]: any } = {}; // tslint:disable-line:no-any

      // Add error code
      if (error.code && typeof error.code === 'string') {
        baseErrorDetails.code = error.code;
      } else if (error.name && typeof error.name === 'string') {
        baseErrorDetails.code = kebabCase(error.name);
      } else {
        baseErrorDetails.code = DEFAULT_ERROR_CODE;
      }

      // Add error details
      if (typeof error.details === 'object') {
        baseErrorDetails = { ...error.details, ...baseErrorDetails };
      } else if (error.details) {
        baseErrorDetails.originalDetails = error.details;
      }

      const baseError = new BaseError(error.message, baseErrorDetails);

      // Update stack trace
      baseError.stack = error.stack;

      return baseError;
    }

    // Return default error
    return new BaseError(DEFAULT_ERROR_MESSAGE, { code: DEFAULT_ERROR_CODE, originalError: safeJsonStringify(error) });
  }
}
