import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request) {
  const { customer } = await request.json()

  const prompt = `You are a sales assistant. Generate a short, friendly, 
personalized follow-up message for a salesperson to send to a customer.

Customer details:
- Name: ${customer.name}
- Product interested in: ${customer.product || 'unknown'}
- Brand: ${customer.brand || 'unknown'}
- Budget: ${customer.budget || 'unknown'}
- Objection: ${customer.objection || 'none'}
- Interest level: ${customer.interest_level}

Write a natural WhatsApp message (2-3 sentences max). 
Do not use formal language. Be warm and conversational.
Write the message only, no extra explanation.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  })

  return Response.json({ message: completion.choices[0].message.content })
}