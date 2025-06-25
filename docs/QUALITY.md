# Quality Assurance

This project uses comprehensive testing and quality assurance practices to ensure high code quality and reliability.

## Testing Strategy

### 1. Unit Testing (Vitest)

- Fast, isolated tests for individual functions and components
- Coverage reporting available
- Run with: `npm run test`

### 2. Integration Testing

- Tests that verify component interactions
- Database integration tests with Prisma
- API endpoint testing

### 3. End-to-End Testing (Playwright)

- Full user workflow testing
- Cross-browser compatibility
- Run with: `npm run test:e2e`

### 4. Mutation Testing (Stryker)

- Tests the quality of your tests by introducing mutations
- Measures how well tests catch bugs
- Provides mutation score as a quality metric
- Run with: `npm run test:mutation`

## Quality Metrics

### Mutation Testing Thresholds

- **High**: 80% - Excellent test quality
- **Low**: 60% - Acceptable test quality
- **Break**: 50% - Below this fails the build

### Coverage Goals

- **Unit Test Coverage**: >90%
- **Mutation Score**: >80%
- **E2E Coverage**: Critical user paths

## Running Quality Checks

### Local Development

```bash
# Run all tests
npm run test

# Run mutation testing (comprehensive quality check)
npm run test:mutation

# Run complete quality check
npm run quality:check
```

### CI/CD Pipeline

The GitHub Actions workflow automatically runs:

1. Unit tests with coverage
2. E2E tests
3. Mutation testing
4. Uploads reports as artifacts

## Interpreting Mutation Test Results

Mutation testing works by:

1. Creating small changes (mutations) in your code
2. Running your test suite against each mutation
3. Measuring how many mutations your tests catch

**Good mutation score indicates:**

- Tests actually verify behavior, not just syntax
- Edge cases are covered
- Tests would catch real bugs

**Low mutation score suggests:**

- Tests might be too simple
- Missing assertions
- Untested edge cases
- Weak test coverage

## Quality Reports

Reports are generated in:

- `reports/mutation/mutation.html` - Interactive mutation report
- `reports/mutation/mutation.json` - Machine-readable results

## Best Practices

1. **Write meaningful tests** - Test behavior, not implementation
2. **Test edge cases** - Null values, empty arrays, boundary conditions
3. **Use descriptive test names** - Tests should read like specifications
4. **Keep tests fast** - Unit tests should run in milliseconds
5. **Review mutation survivors** - Learn from mutations that escape your tests
