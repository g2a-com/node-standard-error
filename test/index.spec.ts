import { describe, it } from 'mocha';
import { expect } from 'chai';
import BaseError, { ValidationError } from '../src';

class ExampleError extends BaseError {
  static defaultMessage = 'Example error default';
}

describe('standard-error', function () {
  describe('BaseError', function () {
    describe('constructor', function () {
      it('should create example error with provided params', function () {
        const error = new ExampleError('Example error message', {
          code: 'example-error-code',
          foo: 'foo',
          bar: 'bar',
          fooBar: 'foo-bar'
        });

        expect(error.name).to.be.equal('ExampleError');
        expect(error.code).to.be.equal('example-error-code');
        expect(error.message).to.be.equal('Example error message');
        expect(error.details).to.be.deep.equal({
          foo: 'foo',
          bar: 'bar',
          fooBar: 'foo-bar'
        });
      });

      it('should create example error with default message', function () {
        const error = new ExampleError();

        expect(error.name).to.be.equal('ExampleError');
        expect(error.code).to.be.equal('example-error');
        expect(error.message).to.be.equal('Example error default');
        expect(error.details).to.be.deep.equal({});
      });

      it('should create example error with default params', function () {
        const error = new ExampleError({
          foo: 'foo'
        });

        expect(error.name).to.be.equal('ExampleError');
        expect(error.code).to.be.equal('example-error');
        expect(error.message).to.be.equal('Example error default');
        expect(error.details).to.be.deep.equal({
          foo: 'foo'
        });
      });
    });

    describe('.from() static method', function () {
      it('when input is a instance of BaseError, then returns exact the same instance', function () {
        const input = new BaseError();
        const output = BaseError.from(input);

        expect(output).to.be.equal(input);
      });

      it('when error is an Error instance, then returns new BaseError instance', function () {
        const input = new Error('Base error message');
        const output = BaseError.from(input);

        expect(output).to.be.instanceOf(BaseError);
        expect(output).to.have.property('name', 'Error');
        expect(output).to.have.property('code', 'error');
        expect(output).to.have.property('message', 'Base error message');
        expect(output).to.have.property('stack', input.stack);
        expect(output).to.have.property('errors', null);
        expect(output).to.have.deep.property('details', {});
      });

      it('when input is an error-like object, then returns new BaseError instance', function () {
        const input = {
          stack: 'stack',
          message: 'test message',
          code: 'test-code',
          details: { prop: 1 }
        };
        const output = BaseError.from(input);

        expect(output).to.be.instanceOf(BaseError);
        expect(output).to.have.property('name', 'UnknownError');
        expect(output).to.have.property('code', 'test-code');
        expect(output).to.have.property('message', 'test message');
        expect(output).to.have.property('stack', 'stack');
        expect(output).to.have.property('errors', null);
        expect(output).to.have.deep.property('details', { prop: 1 });
      });

      it('when input is an empty object, then return error filled with default values', function () {
        const input = {};
        const output = BaseError.from(input);

        expect(output).to.be.instanceOf(BaseError);
        expect(output).to.have.property('name', 'UnknownError');
        expect(output).to.have.property('code', 'unknown-error');
        expect(output).to.have.property('message', 'Unknown Error');
        expect(output).to.have.property('stack').which.is.a('string');
        expect(output).to.have.property('errors', null);
        expect(output).to.have.deep.property('details', {});
      });

      it('when input has extra properties, then return error should have .details.extraPropertiesFromOriginalError property set', function () {
        const input = { details: { detailsProp: 1 }, extraPropA: 2, extraPropB: 3 };
        const output = BaseError.from(input);
        expect(output).to.have.deep.property('details', {
          detailsProp: 1,
          extraPropertiesFromOriginalError: `{"extraPropA":2,"extraPropB":3}`
        });
      });

      it('when input is not an object, then return error with .details.originalError property set', function () {
        const input = 7;
        const output = BaseError.from(input);

        expect(output).to.be.instanceOf(BaseError);
        expect(output).to.have.property('name', 'UnknownError');
        expect(output).to.have.property('code', 'unknown-error');
        expect(output).to.have.property('message', 'Unknown Error');
        expect(output).to.have.property('stack').which.is.a('string');
        expect(output).to.have.property('errors', null);
        expect(output).to.have.deep.property('details', { originalError: '7' });
      });

      it('when input object properties have mismatched types, then they should be ignored', function () {
        const input = {
          name: true,
          code: true,
          message: true,
          stack: true,
          errors: true,
          details: true
        };
        const output = BaseError.from(input);

        expect(output).to.be.instanceOf(BaseError);
        expect(output).to.have.property('name', 'UnknownError');
        expect(output).to.have.property('code', 'unknown-error');
        expect(output).to.have.property('message', 'Unknown Error');
        expect(output).to.have.property('stack').which.is.a('string');
        expect(output).to.have.property('errors', null);
        expect(output).to.have.deep.property('details', {});
      });

      it('when input is null, then should return error', function () {
        const input = null;
        const output = BaseError.from(input);
        expect(output).to.be.instanceOf(BaseError);
      });
    });
  });

  describe('ValidationError', function () {
    describe('constructor', function () {
      it('when called with message and params, then don\'t uses defaults', function () {
        const error = new ValidationError('Example error message', { code: 'example-error-code', errors: [] });
        expect(error).to.have.property('message', 'Example error message');
        expect(error).to.have.property('code', 'example-error-code');
      });

      it('when called with params, then uses default message', function () {
        const error = new ValidationError({ code: 'example-error-code', errors: [] });
        expect(error).to.have.property('message', ValidationError.defaultMessage);
        expect(error).to.have.property('code', 'example-error-code');
      });
    });

    describe('.from() static method', function () {
      it('when called, returns instance of ValidationError', function () {
        const output = ValidationError.from({});
        expect(output).to.be.instanceOf(ValidationError);
      });
    });
  });
});
