import 'jest';
import BaseError, { ValidationError } from '../src';

class ExampleError extends BaseError {
  static defaultMessage = 'Example error default';
}

describe('standard-error', function () {
  describe('BaseError', function () {
    describe('constructor', function () {
      test('should create example error with provided params', function () {
        const error = new ExampleError('Example error message', {
          code: 'example-error-code',
          foo: 'foo',
          bar: 'bar',
          fooBar: 'foo-bar'
        });

        expect(error.name).toEqual('ExampleError');
        expect(error.code).toEqual('example-error-code');
        expect(error.message).toEqual('Example error message');
        expect(error.details).toEqual({
          foo: 'foo',
          bar: 'bar',
          fooBar: 'foo-bar'
        });
      });

      test('should create example error with default message', function () {
        const error = new ExampleError();

        expect(error.name).toEqual('ExampleError');
        expect(error.code).toEqual('example-error');
        expect(error.message).toEqual('Example error default');
        expect(error.details).toEqual({});
      });

      test('should create example error with default params', function () {
        const error = new ExampleError({
          foo: 'foo'
        });

        expect(error.name).toEqual('ExampleError');
        expect(error.code).toEqual('example-error');
        expect(error.message).toEqual('Example error default');
        expect(error.details).toEqual({
          foo: 'foo'
        });
      });
    });

    describe('.from() static method', function () {
      test('when input is a instance of BaseError, then returns exact the same instance', function () {
        const input = new BaseError();
        const output = BaseError.from(input);

        expect(output).toEqual(input);
      });

      test('when error is an Error instance, then returns new BaseError instance', function () {
        const input = new Error('Base error message');
        const output = BaseError.from(input);

        expect(output).toBeInstanceOf(BaseError);
        expect(output).toHaveProperty('name', 'UnknownError');
        expect(output).toHaveProperty('code', 'unknown-error');
        expect(output).toHaveProperty('message', 'Base error message');
        expect(output).toHaveProperty('stack', input.stack);
        expect(output).toHaveProperty('errors', null);
        expect(output).toHaveProperty('details', expect.any(Object));
      });

      test('when input is an error-like object, then returns new BaseError instance', function () {
        const input = {
          stack: 'stack',
          message: 'test message',
          code: 'test-code',
          details: { prop: 1 }
        };
        const output = BaseError.from(input);

        expect(output).toBeInstanceOf(BaseError);
        expect(output).toHaveProperty('name', 'UnknownError');
        expect(output).toHaveProperty('code', 'test-code');
        expect(output).toHaveProperty('message', 'test message');
        expect(output).toHaveProperty('stack', 'stack');
        expect(output).toHaveProperty('errors', null);
        expect(output).toHaveProperty('details.prop', 1);
      });

      test('when input is an empty object, then return error filled with default values', function () {
        const input = {};
        const output = BaseError.from(input);

        expect(output).toBeInstanceOf(BaseError);
        expect(output).toHaveProperty('name', 'UnknownError');
        expect(output).toHaveProperty('code', 'unknown-error');
        expect(output).toHaveProperty('message', 'Unknown Error');
        expect(output).toHaveProperty('stack', expect.any(String));
        expect(output).toHaveProperty('errors', null);
        expect(output).toHaveProperty('details', expect.any(Object));
      });

      test('when input has extra properties, then return error should have .details.extraPropertiesFromOriginalError property set', function () {
        const input = { details: { detailsProp: 1 }, extraPropA: 2, extraPropB: 3 };
        const output = BaseError.from(input);
        expect(output).toHaveProperty('details', {
          detailsProp: 1,
          extraPropertiesFromOriginalError: `{"extraPropA":2,"extraPropB":3}`
        });
      });

      test('when input is not an object, then return error with .details.originalError property set', function () {
        const input = 7;
        const output = BaseError.from(input);

        expect(output).toBeInstanceOf(BaseError);
        expect(output).toHaveProperty('name', 'UnknownError');
        expect(output).toHaveProperty('code', 'unknown-error');
        expect(output).toHaveProperty('message', 'Unknown Error');
        expect(output).toHaveProperty('stack', expect.any(String));
        expect(output).toHaveProperty('errors', null);
        expect(output).toHaveProperty('details.originalError', '7');
      });

      test('when input object properties have mismatched types, then they should be ignored', function () {
        const input = {
          name: true,
          code: true,
          message: true,
          stack: true,
          errors: true,
          details: true
        };
        const output = BaseError.from(input);

        expect(output).toBeInstanceOf(BaseError);
        expect(output).toHaveProperty('name', 'UnknownError');
        expect(output).toHaveProperty('code', 'unknown-error');
        expect(output).toHaveProperty('message', 'Unknown Error');
        expect(output).toHaveProperty('stack', expect.any(String));
        expect(output).toHaveProperty('errors', null);
        expect(output).toHaveProperty('details', expect.any(Object));
      });

      test('when input is null, then should return error', function () {
        const input = null;
        const output = BaseError.from(input);
        expect(output).toBeInstanceOf(BaseError);
      });

      it('when name is specified, then it should be preserved in the .details.originalErrorName property', function () {
        const input = { name: 'SomeCustomName' };
        const output = BaseError.from(input);
        expect(output.name).toEqual('UnknownError');
        expect(output).toHaveProperty('details.originalErrorName', 'SomeCustomName');
      });
    });
  });

  describe('ValidationError', function () {
    describe('constructor', function () {
      test('when called with message and params, then don\'t uses defaults', function () {
        const error = new ValidationError('Example error message', { code: 'example-error-code', errors: [] });
        expect(error).toHaveProperty('message', 'Example error message');
        expect(error).toHaveProperty('code', 'example-error-code');
      });

      test('when called with params, then uses default message', function () {
        const error = new ValidationError({ code: 'example-error-code', errors: [] });
        expect(error).toHaveProperty('message', ValidationError.defaultMessage);
        expect(error).toHaveProperty('code', 'example-error-code');
      });
    });

    describe('.from() static method', function () {
      test('when called, returns instance of ValidationError', function () {
        const output = ValidationError.from({});
        expect(output).toBeInstanceOf(ValidationError);
        expect(output.name).toEqual('ValidationError');
      });
    });
  });

  describe('custom subclasses of BaseError', function () {
    it(`when defaultMessage is set, then it's value should be used when message is not specified`, function () {
      class CustomError extends BaseError {
       static defaultMessage = 'DEFAULT MESSAGE'
      }

      const instance = new CustomError();

      expect(instance).toHaveProperty('message', 'DEFAULT MESSAGE');
    });
  });
});
