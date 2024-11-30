// 'http://localhost:5173' Không cần localhost nữa vì ở file config/cors đã luôn cho phép môi trường
// dev (env.BUILD_MODE === 'dev')
// ..vv ví dụ sau này sẽ deploy lên domain chính thức ,...
// constant

import { env } from '~/config/environment';

export const WHITELIST_DOMAINS = ['https://trello-ui-baongo.vercel.app'];

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT;
