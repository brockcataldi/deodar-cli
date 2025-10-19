import { describe, it, expect } from 'vitest'
import {
	ERROR,
	SUCCESS,
	NOTICE,
	INVALID_PROJECT_LOCATION,
	BUILD_START,
	BUILD_END,
	BUILD_SUCCESS
} from '../messages.js'

describe('messages', () => {
	describe('ERROR', () => {
		it('should format error messages with red styling', () => {
			const message = 'Something went wrong'
			const result = ERROR(message)

			expect(result).toContain('✘')
			expect(result).toContain('ERROR')
			expect(result).toContain(message)
		})

		it('should handle empty error messages', () => {
			const result = ERROR('')

			expect(result).toContain('✘')
			expect(result).toContain('ERROR')
		})
	})

	describe('SUCCESS', () => {
		it('should format success messages with green styling', () => {
			const message = 'Operation completed successfully'
			const result = SUCCESS(message)

			expect(result).toContain('✔')
			expect(result).toContain('SUCCESS')
			expect(result).toContain(message)
		})

		it('should handle empty success messages', () => {
			const result = SUCCESS('')

			expect(result).toContain('✔')
			expect(result).toContain('SUCCESS')
		})
	})

	describe('NOTICE', () => {
		it('should format notice messages with cyan styling', () => {
			const message = 'This is a notice'
			const result = NOTICE(message)

			expect(result).toContain('NOTICE')
			expect(result).toContain(message)
		})

		it('should handle empty notice messages', () => {
			const result = NOTICE('')

			expect(result).toContain('NOTICE')
		})
	})

	describe('INVALID_PROJECT_LOCATION', () => {
		it('should be a pre-formatted error message', () => {
			expect(INVALID_PROJECT_LOCATION).toContain('✘')
			expect(INVALID_PROJECT_LOCATION).toContain('ERROR')
			expect(INVALID_PROJECT_LOCATION).toContain('project folder')
		})
	})

	describe('BUILD_START', () => {
		it('should be a pre-formatted notice message', () => {
			expect(BUILD_START).toContain('NOTICE')
			expect(BUILD_START).toContain('Started')
		})
	})

	describe('BUILD_END', () => {
		it('should be a pre-formatted notice message', () => {
			expect(BUILD_END).toContain('NOTICE')
			expect(BUILD_END).toContain('Finished')
		})
	})

	describe('BUILD_SUCCESS', () => {
		it('should format build success messages with file paths', () => {
			const src = 'src/styles.scss'
			const out = 'build/styles.css'
			const result = BUILD_SUCCESS(src, out)

			expect(result).toContain('✔')
			expect(result).toContain('SUCCESS')
			expect(result).toContain(src)
			expect(result).toContain(out)
			expect(result).toContain('to')
		})

		it('should handle empty file paths', () => {
			const result = BUILD_SUCCESS('', '')

			expect(result).toContain('✔')
			expect(result).toContain('SUCCESS')
			expect(result).toContain('to')
		})

		it('should handle special characters in file paths', () => {
			const src = 'src/components/header.scss'
			const out = 'build/components/header.css'
			const result = BUILD_SUCCESS(src, out)

			expect(result).toContain(src)
			expect(result).toContain(out)
		})
	})
})
