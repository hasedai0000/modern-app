export type PostValidationErrors = {
  content?: string;
};

export function validatePost(content: string): PostValidationErrors {
  const errors: PostValidationErrors = {};

  const trimmed_content = content.trim();

  if (!trimmed_content) {
    errors.content = '投稿内容を入力してください。';
  } else if (trimmed_content.length > 120) {
    errors.content = '投稿内容は120文字以内で入力してください。';
  }

  return errors;
}

export function hasValidationErrors(errors: PostValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
