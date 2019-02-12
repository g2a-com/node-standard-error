module.exports = {
  'verbose': true,
  'testEnvironment': 'node',
  'moduleFileExtensions': [
    'ts',
    'js'
  ],
  'transform': {
    '^.+\\.(ts)$': 'ts-jest'
  },
  'globals': {
    'ts-jest': {
      'tsConfig': './test/tsconfig.json'
    }
  },
  'testRegex': '/test/.*.spec.ts'
};
