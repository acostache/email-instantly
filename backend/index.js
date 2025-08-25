// ESM
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import routes from './src/routes/index.js';

// Load envs from backend/.env then fallback to project root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 1) backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });
// 2) project/.env (one level up)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
});

// Manual CORS (no plugin needed)
// Configure allowed origins
const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) || [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

fastify.addHook('onRequest', async (request, reply) => {
  const origin = request.headers.origin;
  const allowOrigin = origin && corsOrigins.includes(origin) ? origin : corsOrigins[0];
  reply.header('Access-Control-Allow-Origin', allowOrigin);
  reply.header('Vary', 'Origin');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Set to true only if you plan to use credentials and configure it on the client
  // reply.header('Access-Control-Allow-Credentials', 'true');

  if (request.method === 'OPTIONS') {
    reply.code(204).send();
  }
});

fastify.register(routes);

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

fastify.listen({ port: PORT, host: HOST }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
