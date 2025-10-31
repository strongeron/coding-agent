import 'dotenv/config';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { PinoLogger } from '@mastra/loggers';
import { codingAgent } from './agents/coding-agent';
import { chatRoute } from '@mastra/ai-sdk';

export const mastra = new Mastra({
  agents: { codingAgent },
  storage: new LibSQLStore({ url: 'file:../../mastra.db' }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
  observability: {
    default: {
      enabled: true,
    },
  },
  server: {
    port: 4111,
    host: '0.0.0.0',
    apiRoutes: [
      chatRoute({
        path: '/api/chat',
        agent: 'codingAgent',
      }),
    ],
  },
});
