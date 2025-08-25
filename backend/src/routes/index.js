import {DB} from '../db/index.js';
import {generateText} from 'ai';
import {createOpenAI} from '@ai-sdk/openai';

export default async function routes(fastify, options) {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) {
        fastify.log.warn('OPENAI_API_KEY not set');
    }

    // Create an OpenAI provider using the API key explicitly
    const openaiClient = createOpenAI({ apiKey: OPENAI_KEY });

    fastify.get('/ping', async (request, reply) => {
        return 'pong\n';
    });

    fastify.get('/emails', async (request, reply) => {
        const emails = await DB.getEmails();
        if (emails == null) {
            return reply.code(500).send({error: 'Failed to get emails'});
        }
        return emails;
    });

    fastify.post('/email', async (request, reply) => {
        const {to = '', cc = '', bcc = '', subject = '', body = ''} = request.body || {};
        if (!subject) {
            return reply.code(400).send({error: 'subject is required'});
        }
        try {
            const [id] = await DB.addEmail({to, cc, bcc, subject, body});
            return reply.code(201).send({id, to, cc, bcc, subject, body});
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({error: 'Failed to insert email'});
        }
    });

    // AI Router: decide assistant (sales | followup)
    fastify.post('/ai/router', async (request, reply) => {
        const {prompt = ''} = request.body || {};
        if (!prompt) return reply.code(400).send({error: 'prompt is required'});
        try {
            const model = openaiClient('gpt-4o-mini');
            // TODO store prompt in DB..
            const system = `You are a routing assistant. Given a short description of an email a user wants to write, choose exactly one assistant:\n- sales: Sales Assistant — generates concise outreach emails tailored to the recipient's business.\n- followup: Follow-up Assistant — generates short, polite follow-up emails (e.g., just checking in).\n\nRules:\n- Output ONLY one word: "sales" or "followup".\n- If the request includes outreach, prospecting, cold email, pitch, demo, product, or tailoring to business, choose "sales".\n- If the request mentions reminders, just checking in, following up, or previous message, choose "followup".`;
            // TODO separate routes for sales and followup
            const result = await generateText({model, system, prompt, maxTokens: 10, temperature: 0});
            const choice = (result.text || '').trim().toLowerCase();
            const assistant = choice.includes('follow') ? 'followup' : 'sales';
            return reply.send({assistant});
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({error: err?.message || 'Routing failed'});
        }
    });

    // AI Generate: return {subject, body} based on assistant + prompt
    fastify.post('/ai/generate', async (request, reply) => {
        const {assistant = 'sales', prompt = ''} = request.body || {};
        if (!prompt) return reply.code(400).send({error: 'prompt is required'});
        try {
            const model = openaiClient('gpt-4o-mini');
            const salesSystem = `You are the Sales Assistant. Generate a highly concise cold outreach email tailored to the recipient's business.\nConstraints:\n- TOTAL words (subject + body) under 40 words.\n- 7–10 words per sentence.\n- Professional, clear, value-focused.\nOutput JSON strictly with keys: subject, body. No other text.`;
            const followupSystem = `You are the Follow-up Assistant. Generate a short, polite follow-up email referencing a previous message.\nConstraints:\n- TOTAL words (subject + body) under 40 words.\n- 7–10 words per sentence.\n- Courteous tone.\nOutput JSON strictly with keys: subject, body. No other text.`;
            const system = assistant === 'followup' ? followupSystem : salesSystem;
            const result = await generateText({model, system, prompt, temperature: 0.7, maxTokens: 100});
            let subject = '';
            let body = '';
            try {
                const parsed = JSON.parse(result.text);
                subject = String(parsed.subject || '').trim();
                body = String(parsed.body || '').trim();
            } catch {
                const mSub = result.text.match(/"subject"\s*:\s*"([\s\S]*?)"/i);
                const mBody = result.text.match(/"body"\s*:\s*"([\s\S]*?)"/i);
                subject = (mSub?.[1] || '').replace(/\\n/g, '\n');
                body = (mBody?.[1] || '').replace(/\\n/g, '\n');
            }
            return reply.send({subject, body});
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({error: err?.message || 'Generation failed'});
        }
    });
}
