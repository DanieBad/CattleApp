/**
 * Shared password strength utilities for HealthyHerd.
 *
 * Policy (no special characters required — mobile-friendly):
 *  - Minimum 8 characters
 *  - At least 1 uppercase letter
 *  - At least 1 lowercase letter
 *  - At least 1 digit
 */

export interface PasswordValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Enforces the HealthyHerd password policy.
 * Returns { valid: true, error: null } on success,
 * or { valid: false, error: '<human-readable reason>' } on failure.
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number.' };
  }
  return { valid: true, error: null };
}

export interface PasswordStrength {
  label: 'Too short' | 'Weak' | 'Fair' | 'Strong';
  color: string;
  width: string;
}

/**
 * Returns a visual strength rating for the password strength bar.
 * Returns null when the password is empty.
 */
export function getPasswordStrength(password: string): PasswordStrength | null {
  if (password.length === 0) return null;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  if (password.length < 8) {
    return { label: 'Too short', color: '#EF4444', width: '25%' };
  }
  if (!hasUpper || !hasLower) {
    return { label: 'Weak', color: '#F59E0B', width: '50%' };
  }
  if (!hasDigit) {
    return { label: 'Fair', color: '#3B82F6', width: '75%' };
  }
  return { label: 'Strong', color: '#10B981', width: '100%' };
}
