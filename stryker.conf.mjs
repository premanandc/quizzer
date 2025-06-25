/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
const config = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  coverageAnalysis: 'off',
  mutate: [
    'src/lib/utils/**/*.ts',
    '!src/lib/types/**',
    '!src/generated/**',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.spec.ts',
    '!src/**/*.spec.tsx',
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  htmlReporter: {
    fileName: 'reports/mutation/mutation.html',
  },
  timeoutMS: 60000,
  concurrency: 1,
  disableTypeChecks: false,
  vitest: {
    configFile: 'vitest.config.ts',
  },
}

export default config