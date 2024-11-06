// 'http://localhost:5173' Không cần localhost nữa vì ở file config/cors đã luôn cho phép môi trường
// dev (env.BUILD_MODE === 'dev')
// ..vv ví dụ sau này sẽ deploy lên domain chính thức ,...
// constant

export const WHITELIST_DOMAINS = ['https://trello-ui-cyan.vercel.app'];

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};
