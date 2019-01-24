import { describe, it } from 'mocha';
import { expect } from 'chai';
import BaseError from '../src';

class ExampleError extends BaseError {
  static defaultMessage = 'Example error default';
}

describe('extendable-error', function () {
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

  describe('create BaseError by from method', function () {
    it('should return passed base error', function () {
      const error = BaseError.from(new ExampleError());

      expect(error.name).to.be.equal('ExampleError');
      expect(error.code).to.be.equal('example-error');
      expect(error.message).to.be.equal('Example error default');
      expect(error.details).to.be.deep.equal({});
    });

    it('should create and return new base error based on error', function () {
      const originalError = new Error('Base error message');
      const baseError = BaseError.from(originalError);

      expect(baseError.name).to.be.equal('BaseError');
      expect(baseError.code).to.be.equal('error');
      expect(baseError.message).to.be.equal('Base error message');
      expect(baseError.details).to.be.deep.equal({});
      expect(baseError.stack).to.be.equal(originalError.stack);
    });

    it('should create and return new base error based on error like object', function () {
      const errorLike = {
        stack: 'stack',
        message: 'test message',
        code: 'test-code',
        details: {}
      };
      const baseError = BaseError.from(errorLike);

      expect(baseError.name).to.be.equal('BaseError');
      expect(baseError.code).to.be.equal('test-code');
      expect(baseError.message).to.be.equal('test message');
      expect(baseError.details).to.be.deep.equal({});
      expect(baseError.stack).to.be.equal(errorLike.stack);
    });

    it('should create and return new base error based on a string', function () {
      const baseError = BaseError.from('foo');

      expect(baseError.name).to.be.equal('BaseError');
      expect(baseError.code).to.be.equal('unknown-error');
      expect(baseError.message).to.be.equal('Unknown Error');
      expect(baseError.details).to.be.deep.equal({
        originalError: `"foo"`
      });
      expect(baseError.stack).to.be.a('string');
    });

    it('should create and return new base error based on anything', function () {
      const baseError = BaseError.from(null);

      expect(baseError.name).to.be.equal('BaseError');
      expect(baseError.code).to.be.equal('unknown-error');
      expect(baseError.message).to.be.equal('Unknown Error');
      expect(baseError.details).to.be.deep.equal({
        originalError: 'null'
      });
      expect(baseError.stack).to.be.a('string');
    });
  });
});
