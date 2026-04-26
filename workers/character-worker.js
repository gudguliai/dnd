import { HfInference } from '@huggingface/inference';

const hf = new HfInference(Deno.env.get('HF_API_KEY'));

export default {
  async fetch(request) {
    if (request.method === 'POST') {
      try {
        const { prompt } = await request.json();
        const response = await hf.textGeneration({
          model: 'gudguli/dnd-character-gen-3b',
          inputs: prompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
          },
        });
        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Worker error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return new Response('D&D Character Generator Worker', { status: 200 });
  },
};
