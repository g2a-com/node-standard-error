import kebabCase from 'lodash.kebabcase';
import camelCase from 'lodash.camelcase';
import capitalize from 'lodash.capitalize';
import safeJsonStringify from 'safe-json-stringify';

const DEFAULT_ERROR_MESSAGE = 'Unknown Error';

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

export default class UnknownError extends Error {
  readonly code: string = '';
  readonly message: string;
  readonly name: string;
  readonly details: object;
  readonly errors: SubError[] | null;
  static defaultMessage?: string;

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
    this.message = message || (this.constructor as typeof UnknownError).defaultMessage || DEFAULT_ERROR_MESSAGE;
    this.details = safeJsonStringify.ensureProperties(details);
    this.errors = (!errors || errors.length === 0) ? null : errors.map(error => ({
      message: error.message,
      code: error.code || this.code,
      field: error.field,
      data: error.data || {}
    }));

    Error.captureStackTrace(this, this.constructor);
  }

  static from (error: unknown): UnknownError {
    // Don't remap our own errors
    if (error instanceof UnknownError) {
      return error;
    }

    // If original error is not an object it cannot be easily mapped
    if (!error || typeof error !== 'object') {
      return UnknownError.from({ details: { originalError: safeJsonStringify(error as any) } });
    }

    // Map important data from original error
    const { name, message, stack, code, errors, details, ...extraProperties } = (error || {}) as Record<string, unknown>;
    const mappedMessage = typeof message === 'string' ? message : this.defaultMessage || DEFAULT_ERROR_MESSAGE;
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

    // If original name is different than new one, add it to details
    if (name !== undefined && name !== this.name) {
      (mappedDetails as any).originalErrorName = name;
    }

    // Create new error instance
    const mappedError = new this(mappedMessage, {
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

export class ValidationError extends UnknownError {
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
