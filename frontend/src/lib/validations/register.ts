export type RegisterValidationErrors = {
  username?: string;
  email?: string;
  password?: string;
};

export function validateRegister(
  username: string,
  email: string,
  password: string
): RegisterValidationErrors {
  const errors: RegisterValidationErrors = {};

  if (!username) {
    errors.username = 'ユーザーネームを入力してください。';
  } else if (username.length > 20) {
    errors.username = 'ユーザーネームは20文字以内で入力してください。';
  }

  if (!email) {
    errors.email = 'メールアドレスを入力してください。';
  } else {
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(email)) {
      errors.email = '有効なメールアドレスを入力してください。';
    }
  }

  if (!password) {
    errors.password = 'パスワードを入力してください。';
  } else if (password.length < 6) {
    errors.password = 'パスワードは6文字以上で入力してください。';
  }

  return errors;
}

export function hasValidationErrors(errors: RegisterValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
