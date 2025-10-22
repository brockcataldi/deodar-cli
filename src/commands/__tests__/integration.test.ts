import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { spawn } from 'child_process'
import path from 'path'
import {
	createMockProject,
	cleanupTempDir
} from '../../test-utils/index.js'

describe('CLI Integration Tests', () => {
	let projectDir: string
	let originalCwd: string

	beforeEach(async () => {
		projectDir = await createMockProject()
		originalCwd = process.cwd()
		process.chdir(projectDir)
	})

	afterEach(async () => {
		process.chdir(originalCwd)
		await cleanupTempDir(projectDir)
	})

	const runCommand = (
		args: string[]
	): Promise<{ code: number; stdout: string; stderr: string }> => {
		return new Promise((resolve) => {
			// Use absolute path to the built CLI
			const cliPath = path.resolve(originalCwd, 'dist/index.js')
			const child = spawn('node', [cliPath, ...args], {
				cwd: projectDir,
				stdio: 'pipe'
			})

			let stdout = ''
			let stderr = ''

			child.stdout?.on('data', (data) => {
				stdout += data.toString()
			})

			child.stderr?.on('data', (data) => {
				stderr += data.toString()
			})

			child.on('close', (code) => {
				resolve({
					code: code || 0,
					stdout,
					stderr
				})
			})
		})
	}

	describe('new command', () => {
		it('should show help when no arguments provided', async () => {
			const result = await runCommand(['new', '--help'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain('Create a new block')
		})

		it('should fail when not in a valid project directory', async () => {
			// Change to a non-project directory
			process.chdir('/tmp')

			const result = await runCommand(['new', 'test-block'])

			expect(result.code).toBe(1) // The command exits with error code
			expect(result.stdout).toContain('ERROR')
			expect(result.stdout).toContain('project folder')
		})
	})

	describe('development command', () => {
		it('should show help when requested', async () => {
			const result = await runCommand(['development', '--help'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain('Build a Development Build')
		})

		it('should fail when not in a valid project directory', async () => {
			process.chdir('/tmp')

			const result = await runCommand(['development'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain('ERROR')
			expect(result.stdout).toContain('project folder')
		})
	})

	describe('production command', () => {
		it('should show help when requested', async () => {
			const result = await runCommand(['production', '--help'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain('Build a Production Build')
		})

		it('should fail when not in a valid project directory', async () => {
			process.chdir('/tmp')

			const result = await runCommand(['production'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain('ERROR')
			expect(result.stdout).toContain('project folder')
		})
	})

	describe('watch command', () => {
		it('should show help when requested', async () => {
			const result = await runCommand(['watch', '--help'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain(
				'Start a Watching Development Build'
			)
		})

		it('should fail when not in a valid project directory', async () => {
			process.chdir('/tmp')

			const result = await runCommand(['watch'])

			expect(result.code).toBe(0) // Watch command exits gracefully
			expect(result.stdout).toContain('ERROR')
			expect(result.stdout).toContain('project folder')
		})
	})

	describe('bundle command', () => {
		it('should show help when requested', async () => {
			const result = await runCommand(['bundle', '--help'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain(
				'Bundle current Deodar project'
			)
		})

		it('should fail when not in a valid project directory', async () => {
			process.chdir('/tmp')

			const result = await runCommand(['bundle'])

			expect(result.code).toBe(1) // Bundle command exits with error code
			expect(result.stdout).toContain('ERROR')
			expect(result.stdout).toContain('project folder')
		})
	})

	describe('main CLI', () => {
		it('should show version information', async () => {
			const result = await runCommand(['--version'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain('2.0.0')
		})

		it('should show help information', async () => {
			const result = await runCommand(['--help'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain('Deodar')
			expect(result.stdout).toContain('The Deodar CLI Tool')
		})

		it('should show available commands', async () => {
			const result = await runCommand(['--help'])

			expect(result.code).toBe(0)
			expect(result.stdout).toContain('new')
			expect(result.stdout).toContain('development')
			expect(result.stdout).toContain('production')
			expect(result.stdout).toContain('watch')
			expect(result.stdout).toContain('bundle')
		})
	})
})
