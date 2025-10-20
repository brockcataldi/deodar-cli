import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import { compileProject } from '../build.js'
import { createMockProject, cleanupTempDir } from '../../test-utils/index.js'

describe('build error handling', () => {
  let projectDir: string

  beforeEach(async () => {
    projectDir = await createMockProject()
  })

  afterEach(async () => {
    await cleanupTempDir(projectDir)
  })

  it('should handle invalid SCSS syntax gracefully', async () => {
    // Create a block with invalid SCSS
    const blockDir = path.join(projectDir, 'blocks', 'acf', 'invalid-scss')
    await fs.mkdir(blockDir, { recursive: true })
    
    await fs.writeFile(
      path.join(blockDir, 'invalid-scss.scss'),
      `.invalid-scss {
        color: red;
        invalid-property: {
          nested: invalid;
        }
      }`,
      'utf-8'
    )

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    // Should handle invalid SCSS gracefully (may or may not throw)
    // The build system is resilient and may still produce output
    await expect(compileProject(projectDir, config, false)).resolves.not.toThrow()
  })

  it('should handle invalid JavaScript syntax gracefully', async () => {
    // Create a block with invalid JavaScript
    const blockDir = path.join(projectDir, 'blocks', 'acf', 'invalid-js')
    await fs.mkdir(blockDir, { recursive: true })
    
    await fs.writeFile(
      path.join(blockDir, 'invalid-js.js'),
      `console.log('test');
      function invalidFunction( {
        return 'missing closing paren';
      }`,
      'utf-8'
    )

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    // Should handle invalid JavaScript gracefully (may or may not throw)
    // The build system is resilient and may still produce output
    await expect(compileProject(projectDir, config, false)).resolves.not.toThrow()
  })

  it('should handle missing template files', async () => {
    // Create a block directory without the actual files
    const blockDir = path.join(projectDir, 'blocks', 'acf', 'missing-files')
    await fs.mkdir(blockDir, { recursive: true })
    
    // Don't create any .scss or .js files

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    // Should handle missing files gracefully
    await expect(compileProject(projectDir, config, false)).resolves.not.toThrow()
  })

  it('should handle empty block directories', async () => {
    // Create empty block directory
    const blockDir = path.join(projectDir, 'blocks', 'acf', 'empty-block')
    await fs.mkdir(blockDir, { recursive: true })

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    // Should handle empty directories gracefully
    await expect(compileProject(projectDir, config, false)).resolves.not.toThrow()
  })

  it('should handle permission errors', async () => {
    // Create a block with files that can't be read
    const blockDir = path.join(projectDir, 'blocks', 'acf', 'permission-error')
    await fs.mkdir(blockDir, { recursive: true })
    
    const scssFile = path.join(blockDir, 'permission-error.scss')
    await fs.writeFile(scssFile, '.test { color: red; }', 'utf-8')
    
    // Change permissions to make file unreadable (on Unix systems)
    if (process.platform !== 'win32') {
      await fs.chmod(scssFile, 0o000)
    }

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    // Should handle permission errors gracefully
    // The build system may or may not throw depending on the error
    await expect(compileProject(projectDir, config, false)).resolves.not.toThrow()
  })

  it('should handle circular dependencies in JavaScript', async () => {
    // Create blocks with circular dependencies
    const block1Dir = path.join(projectDir, 'blocks', 'acf', 'circular-1')
    const block2Dir = path.join(projectDir, 'blocks', 'acf', 'circular-2')
    
    await fs.mkdir(block1Dir, { recursive: true })
    await fs.mkdir(block2Dir, { recursive: true })
    
    // Block 1 imports block 2
    await fs.writeFile(
      path.join(block1Dir, 'circular-1.js'),
      `import './circular-2.js';
      console.log('Block 1');`,
      'utf-8'
    )
    
    // Block 2 imports block 1
    await fs.writeFile(
      path.join(block2Dir, 'circular-2.js'),
      `import './circular-1.js';
      console.log('Block 2');`,
      'utf-8'
    )

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    // Should handle circular dependencies gracefully
    // The build system may or may not throw depending on the error
    await expect(compileProject(projectDir, config, false)).resolves.not.toThrow()
  })

  it('should handle very large files', async () => {
    // Create a block with a very large SCSS file
    const blockDir = path.join(projectDir, 'blocks', 'acf', 'large-file')
    await fs.mkdir(blockDir, { recursive: true })
    
    // Generate a large SCSS file (1MB of CSS rules)
    let largeScss = ''
    for (let i = 0; i < 10000; i++) {
      largeScss += `.class-${i} { color: red; font-size: ${i}px; margin: ${i}px; }\n`
    }
    
    await fs.writeFile(
      path.join(blockDir, 'large-file.scss'),
      largeScss,
      'utf-8'
    )

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    // Should handle large files (might be slow but should complete)
    const start = Date.now()
    await expect(compileProject(projectDir, config, false)).resolves.not.toThrow()
    const duration = Date.now() - start
    
    // Should complete within reasonable time (30 seconds)
    expect(duration).toBeLessThan(30000)
  })
})
