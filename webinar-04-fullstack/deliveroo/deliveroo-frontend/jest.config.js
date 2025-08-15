const esModules = ['@angular', 'rxjs', 'zone.js'].join('|');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  transform: {
    '^.+\\.(ts|mjs|js|html|svg)$': 'jest-preset-angular'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(' + esModules + '|.*\\.mjs$))'
  ],
};