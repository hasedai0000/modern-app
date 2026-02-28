export type CommentValidationErrors = {
  content?: string;
};

export function validateComment(content: string): CommentValidationErrors {
  const errors: CommentValidationErrors = {};

  const trimmed_content = content.trim();

  if (!trimmed_content) {
    errors.content = 'コメント内容を入力してください。';
  } else if (trimmed_content.length > 120) {
    errors.content = 'コメント内容は120文字以内で入力してください。';
  }

  return errors;
}

export function hasValidationErrors(errors: CommentValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
