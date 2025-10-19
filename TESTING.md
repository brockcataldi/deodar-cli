# Testing Guide for Deodar CLI

This document explains how to test the deodar-cli project using the comprehensive testing setup.

## Testing Framework

We use **Vitest** as our testing framework, which provides:

- Fast test execution
- Built-in TypeScript support
- ES modules support
- Coverage reporting
- Watch mode for development

## Running Tests

### Install Dependencies

First, install the testing dependencies:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests Once (CI Mode)

```bash
npm run test:run
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests with UI (Interactive)

```bash
npm run test:ui
```

### Run Specific Test Files

```bash
# Run only file-system tests
npm test src/functions/__tests__/file-system.test.ts

# Run only build tests
npm test src/functions/__tests__/build.test.ts
```

## Test Structure

### Unit Tests

Located in `src/**/__tests__/` directories:

- **`file-system.test.ts`** - Tests for file system operations
- **`build.test.ts`** - Tests for build and compilation functions
- **`config.test.ts`** - Tests for configuration loading
- **`messages.test.ts`** - Tests for message formatting

### Integration Tests

Located in `src/commands/__tests__/`:

- **`integration.test.ts`** - End-to-end CLI command tests

### Test Utilities

Located in `src/test-utils/`:

- **`index.ts`** - Helper functions for creating test environments

## Test Categories

### 1. File System Tests

Tests the core file system operations:

- File/directory existence checks
- Finding compilable files (.scss, .js)
- Configuration loading
- Template writing
- Block creation

### 2. Build Tests

Tests the compilation process:

- SCSS to CSS compilation
- JavaScript bundling
- Production vs development builds
- External dependency handling
- Multiple block compilation

### 3. Configuration Tests

Tests project detection and configuration:

- WordPress plugin detection
- WordPress theme detection
- Configuration file loading
- Invalid configuration handling

### 4. Message Tests

Tests the CLI message formatting:

- Error message formatting
- Success message formatting
- Notice message formatting
- Build status messages

### 5. Integration Tests

Tests the CLI commands end-to-end:

- Command help output
- Invalid project directory handling
- Command argument parsing

## Writing New Tests

### Test File Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { functionToTest } from '../module-to-test.js'
import { createTempDir, cleanupTempDir } from '../../test-utils/index.js'

describe('module-name', () => {
	let tempDir: string

	beforeEach(async () => {
		tempDir = await createTempDir()
	})

	afterEach(async () => {
		await cleanupTempDir(tempDir)
	})

	describe('function-name', () => {
		it('should do something specific', async () => {
			// Arrange
			const input = 'test data'

			// Act
			const result = await functionToTest(input)

			// Assert
			expect(result).toBe('expected output')
		})
	})
})
```

### Test Utilities Available

#### `createTempDir(prefix?)`

Creates a temporary directory for testing.

#### `createTempFile(content, extension?, dir?)`

Creates a temporary file with content.

#### `createMockProject(baseDir?)`

Creates a complete mock Deodar project structure.

#### `createMockBlock(blockDir, slug)`

Creates a mock block with all necessary files.

#### `cleanupTempDir(dir)`

Cleans up temporary directories.

#### `wait(ms)`

Waits for a specified amount of time.

#### `captureConsole(fn)`

Captures console output during test execution.

## Testing Best Practices

### 1. Use Descriptive Test Names

```typescript
// Good
it('should return true for existing files')

// Bad
it('should work')
```

### 2. Follow AAA Pattern

- **Arrange**: Set up test data and conditions
- **Act**: Execute the function being tested
- **Assert**: Verify the results

### 3. Test Edge Cases

- Empty inputs
- Invalid inputs
- File system errors
- Network timeouts

### 4. Use Proper Cleanup

Always clean up temporary files and directories:

```typescript
afterEach(async () => {
	await cleanupTempDir(tempDir)
})
```

### 5. Mock External Dependencies

For functions that interact with the file system or external APIs, use the provided test utilities.

## Coverage Goals

We aim for:

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Continuous Integration

Tests run automatically on:

- Pull requests
- Pushes to main branch
- Release builds

## Debugging Tests

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Verbose Output

```bash
npm test -- --reporter=verbose
```

### Debug Specific Test

```bash
npm test -- --run src/functions/__tests__/file-system.test.ts
```

## Common Issues

### 1. File System Permissions

If tests fail due to file system permissions, ensure the test directory is writable.

### 2. Async Operations

Always use `await` for async operations in tests.

### 3. Timeout Issues

For long-running operations, increase the timeout:

```typescript
it('should handle long operation', async () => {
	// test code
}, 10000) // 10 second timeout
```

### 4. Path Issues

Use absolute paths in tests to avoid path resolution issues:

```typescript
import path from 'path'
const filePath = path.join(tempDir, 'test-file.txt')
```

## Performance Testing

For performance-critical functions, add performance tests:

```typescript
it('should compile large project quickly', async () => {
	const start = Date.now()
	await compileProject(largeProjectDir, config, false)
	const duration = Date.now() - start

	expect(duration).toBeLessThan(5000) // Should complete in under 5 seconds
})
```

## Mock Data

Use realistic mock data that reflects real-world usage:

```typescript
const mockConfig = {
	externals: {
		jquery: 'jQuery',
		lodash: '_'
	},
	skip: ['node_modules/**', 'dist/**']
}
```

This testing setup ensures the deodar-cli tool is reliable, maintainable, and works correctly across different environments.
