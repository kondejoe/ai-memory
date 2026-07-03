import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request) {
  const { customer, interactions } = await request.json()

  const notes = interactions.map(i => `- ${i.content}`).join('\n')

  const prompt = `You are a sales assistant. Summarize this customer relationship in 3-4 sentences.

Customer details:
- Name: ${customer.name}
- Product: ${customer.product || 'unknown'}
- Budget: ${customer.budget || 'unknown'}
- Status: ${customer.status}
- Interest level: ${customer.interest_level}
- Objection: ${customer.objection || 'none'}

Interaction history:
${notes || 'No interactions yet'}

Write a clear, concise summary of where things stand and what the salesperson should do next.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  })

  return Response.json({ summary: completion.choices[0].message.content })
}