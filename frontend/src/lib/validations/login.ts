export type LoginValidationErrors = {
  email?: string;
  password?: string;
};

export function validateLogin(
  email: string,
  password: string
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};

  if (!email) {
    errors.email = 'メールアドレスを入力してください。';
  }

  if (!password) {
    errors.password = 'パスワードを入力してください。';
  }

  return errors;
}

export function hasValidationErrors(errors: LoginValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
