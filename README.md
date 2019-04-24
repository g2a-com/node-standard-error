# Standard error

Library extending javascript error.

## Usage:

Creating new standard error:

```javascript
  import BaseError from '@g2a/standard-error';

  class ExampleError extends BaseError {
    static defaultMessage = 'Example error';
  }

  // You can throw error with default message
  throw new ExampleError();

  // You can throw error with your own message
  throw new ExampleError('<NEW_MESSAGE>');

  // You can throw error with your own message, optional code and
  // some optional fields which will be converted to error details
  throw new ExampleError('<NEW_MESSAGE>', { code: '<ERROR_CODE>', foo: 'foo' });

  // You can throw error only with optional code
  // or some optional fields which will be converted to details
  throw new ExampleError({ code: '<ERROR_CODE>' });
```

Creating standard error based on normal error (or something else):

```javascript
  import BaseError from '@g2a/standard-error';

  const error = new Error('<ERROR_MESSAGE>');
  const yourError = BaseError.from(error);
```

