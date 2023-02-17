import { Validation } from '../interfaces/validation'

export const setInvalidResponse = (message: string): Validation => ({
  valid: false,
  message: message,
})

export const VALID_CONFIG: Validation = {
  valid: true,
  message: '',
}
