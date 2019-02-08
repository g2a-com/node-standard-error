import kebabCase from 'lodash.kebabcase';
import camelCase from 'lodash.camelcase';
import capitalize from 'lodash.capitalize';
import safeJsonStringify from 'safe-json-stringify';

const DEFAULT_ERROR_NAME = 'UnknownError';
const DEFAULT_ERROR_MESSAGE = 'Unknown Error';
const DEFAULT_ERROR_CODE = 'unknown-error';

export interface BaseErrorParams {
  code?: string;
  errors?: SubError[];
  [k: string]: any;
}

export interface SubError {
  message: string;
  code?: string;
  field?: string;
  data?: object;
}

export default class BaseError extends Error {
  readonly code: string = '';
  readonly message: string;
  readonly name: string;
  readonly details: object;
  readonly errors: SubError[] | null;

  constructor (params?: BaseErrorParams)
  constructor (message: string, params?: BaseErrorParams)
  constructor (messageOrParams?: string | BaseErrorParams, params: BaseErrorParams = {}) {
    super();

    let message;
    if (typeof messageOrParams === 'string') {
      message = messageOrParams;
    } else {
      params = messageOrParams || {};
    }

    const { code, errors, ...details } = params;

    this.name = this.constructor.name;
    this.code = code || this.code || kebabCase(this.name);
    this.message = message || (this.constructor as { defaultMessage?: string }).defaultMessage || '';
    this.details = safeJsonStringify.ensureProperties(details);
    this.errors = (!errors || errors.length === 0) ? null : errors.map(error => ({
      message: error.message,
      code: error.code || this.code,
      field: error.field,
      data: error.data || {}
    }));

    Error.captureStackTrace(this, this.constructor);
  }

  static from (error: unknown): BaseError {
    // Don't remap our own errors
    if (error instanceof BaseError) {
      return error;
    }

    // If original error is not an object it cannot be easily mapped
    if (!error || typeof error !== 'object') {
      return BaseError.from({ details: { originalError: safeJsonStringify(error as any) } });
    }

    // Map important data from original error
    const { name, message, stack, code, errors, details, ...extraProperties } = (error || {}) as Record<string, unknown>;
    const mappedName = typeof name === 'string' ? capitalize(camelCase(name)) : DEFAULT_ERROR_NAME;
    const mappedMessage = typeof message === 'string' ? message : DEFAULT_ERROR_MESSAGE;
    const mappedStack = typeof stack === 'string' ? stack : undefined;
    const mappedCode = typeof code === 'string' ? code : undefined;
    const mappedDetails = typeof details === 'object' && details ? details : {};
    const mappedErrors = !Array.isArray(errors) ? undefined : errors
      .map((subError: unknown): SubError => {
        const { message, code, field, data } = (subError || {}) as Record<string, unknown>;
        return {
          message: typeof message === 'string' ? message : '',
          code: typeof code === 'string' ? code : undefined,
          field: typeof field === 'string' ? field : undefined,
          data: typeof data === 'object' && data !== null ? data : undefined
        };
      })
      .filter(mappedSubError => mappedSubError.message);

    // If there are some extra properties on original error, add them to details
    if (Object.keys(extraProperties).length > 0) {
      (mappedDetails as any).extraPropertiesFromOriginalError = safeJsonStringify(extraProperties);
    }

    // Prepare constructor for new error
    class Constructor extends this {}
    Object.defineProperty(Constructor, 'name', { value: mappedName, configurable: true });

    // Create new error instance
    const mappedError = new Constructor(mappedMessage, {
      code: mappedCode,
      errors: mappedErrors,
      ...mappedDetails
    });

    // Replace stack with original one
    if (mappedStack) {
      mappedError.stack = mappedStack;
    }

    return mappedError;
  }
}

export interface ValidationErrorParams extends BaseErrorParams {
  errors: BaseErrorParams['errors']; // The same as on BaseParams but required
}

export class ValidationError extends BaseError {
  static defaultMessage = 'Data doesn\'t pass validation';

  constructor (params: ValidationErrorParams)
  constructor (message: string, params: ValidationErrorParams)
  constructor (messageOrParams: string | ValidationErrorParams, params?: ValidationErrorParams) {
    if (typeof messageOrParams === 'string') {
      super(messageOrParams, params);
    } else {
      super(messageOrParams);
    }
  }
}
