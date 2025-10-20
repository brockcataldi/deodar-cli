import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import { compileProject } from '../build.js'
import { createMockProject, cleanupTempDir } from '../../test-utils/index.js'

describe('performance tests', () => {
  let projectDir: string

  beforeEach(async () => {
    projectDir = await createMockProject()
  })

  afterEach(async () => {
    await cleanupTempDir(projectDir)
  })

  it('should compile small project quickly', async () => {
    // Create a small project with one block
    const blockDir = path.join(projectDir, 'blocks', 'acf', 'small-block')
    await fs.mkdir(blockDir, { recursive: true })
    
    await fs.writeFile(
      path.join(blockDir, 'small-block.scss'),
      `.small-block { color: red; }`,
      'utf-8'
    )
    
    await fs.writeFile(
      path.join(blockDir, 'small-block.js'),
      `console.log('small block');`,
      'utf-8'
    )

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    const start = Date.now()
    await compileProject(projectDir, config, false)
    const duration = Date.now() - start

    // Small project should compile in under 2 seconds
    expect(duration).toBeLessThan(2000)
  })

  it('should compile medium project within reasonable time', async () => {
    // Create a medium project with 5 blocks
    for (let i = 1; i <= 5; i++) {
      const blockDir = path.join(projectDir, 'blocks', 'acf', `block-${i}`)
      await fs.mkdir(blockDir, { recursive: true })
      
      // Create SCSS with some complexity
      let scss = `.block-${i} {\n`
      for (let j = 1; j <= 10; j++) {
        scss += `  &__element-${j} {\n    color: red;\n    font-size: ${j}px;\n  }\n`
      }
      scss += `}`
      
      await fs.writeFile(
        path.join(blockDir, `block-${i}.scss`),
        scss,
        'utf-8'
      )
      
      // Create JS with some complexity
      let js = `class Block${i} {\n  constructor() {\n    this.init();\n  }\n\n  init() {\n    console.log('Block ${i} initialized');\n  }\n}\n\nnew Block${i}();`
      
      await fs.writeFile(
        path.join(blockDir, `block-${i}.js`),
        js,
        'utf-8'
      )
    }

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    const start = Date.now()
    await compileProject(projectDir, config, false)
    const duration = Date.now() - start

    // Medium project should compile in under 5 seconds
    expect(duration).toBeLessThan(5000)
  })

  it('should handle production builds efficiently', async () => {
    // Create a project with multiple blocks
    for (let i = 1; i <= 3; i++) {
      const blockDir = path.join(projectDir, 'blocks', 'acf', `prod-block-${i}`)
      await fs.mkdir(blockDir, { recursive: true })
      
      // Create SCSS with comments and whitespace (for minification testing)
      const scss = `/* Block ${i} styles */
      .prod-block-${i} {
        color: red;
        
        /* Nested element */
        &__title {
          font-weight: bold;
        }
      }`
      
      await fs.writeFile(
        path.join(blockDir, `prod-block-${i}.scss`),
        scss,
        'utf-8'
      )
      
      // Create JS with comments and whitespace
      const js = `// Block ${i} JavaScript
      function initBlock${i}() {
        console.log('Block ${i} loaded');
      }
      
      initBlock${i}();`
      
      await fs.writeFile(
        path.join(blockDir, `prod-block-${i}.js`),
        js,
        'utf-8'
      )
    }

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    // Test development build
    const devStart = Date.now()
    await compileProject(projectDir, config, false)
    const devDuration = Date.now() - devStart

    // Test production build
    const prodStart = Date.now()
    await compileProject(projectDir, config, true)
    const prodDuration = Date.now() - prodStart

    // Both should complete within reasonable time
    expect(devDuration).toBeLessThan(3000)
    expect(prodDuration).toBeLessThan(3000)
    
    // Production build might be slightly slower due to minification
    // but shouldn't be significantly slower
    expect(prodDuration).toBeLessThan(devDuration * 2)
  })

  it('should handle large SCSS files efficiently', async () => {
    const blockDir = path.join(projectDir, 'blocks', 'acf', 'large-scss')
    await fs.mkdir(blockDir, { recursive: true })
    
    // Generate a large SCSS file (but not too large for tests)
    let largeScss = ''
    for (let i = 0; i < 1000; i++) {
      largeScss += `.large-class-${i} {
        color: red;
        font-size: ${i}px;
        margin: ${i}px;
        padding: ${i}px;
        
        &:hover {
          color: blue;
        }
        
        &::before {
          content: '${i}';
        }
      }\n`
    }
    
    await fs.writeFile(
      path.join(blockDir, 'large-scss.scss'),
      largeScss,
      'utf-8'
    )

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    const start = Date.now()
    await compileProject(projectDir, config, false)
    const duration = Date.now() - start

    // Large SCSS should compile in under 10 seconds
    expect(duration).toBeLessThan(10000)
  })

  it('should handle large JavaScript files efficiently', async () => {
    const blockDir = path.join(projectDir, 'blocks', 'acf', 'large-js')
    await fs.mkdir(blockDir, { recursive: true })
    
    // Generate a large JavaScript file
    let largeJs = 'class LargeBlock {\n'
    for (let i = 0; i < 500; i++) {
      largeJs += `  method${i}() {
    console.log('Method ${i} called');
    return ${i};
  }\n`
    }
    largeJs += '}\n\nnew LargeBlock();'
    
    await fs.writeFile(
      path.join(blockDir, 'large-js.js'),
      largeJs,
      'utf-8'
    )

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    const start = Date.now()
    await compileProject(projectDir, config, false)
    const duration = Date.now() - start

    // Large JS should compile in under 5 seconds
    expect(duration).toBeLessThan(5000)
  })

  it('should handle concurrent compilation efficiently', async () => {
    // Create multiple blocks that will be compiled concurrently
    const blockPromises = []
    
    for (let i = 1; i <= 10; i++) {
      const blockDir = path.join(projectDir, 'blocks', 'acf', `concurrent-block-${i}`)
      await fs.mkdir(blockDir, { recursive: true })
      
      await fs.writeFile(
        path.join(blockDir, `concurrent-block-${i}.scss`),
        `.concurrent-block-${i} { color: red; }`,
        'utf-8'
      )
      
      await fs.writeFile(
        path.join(blockDir, `concurrent-block-${i}.js`),
        `console.log('Concurrent block ${i}');`,
        'utf-8'
      )
    }

    const config = {
      cwd: projectDir,
      externals: { jquery: 'jQuery' },
      skip: []
    }

    const start = Date.now()
    await compileProject(projectDir, config, false)
    const duration = Date.now() - start

    // Concurrent compilation should be efficient
    // 10 blocks should compile in under 8 seconds
    expect(duration).toBeLessThan(8000)
  })
})
