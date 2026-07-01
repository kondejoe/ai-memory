import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  })

  return Response.json({ message: message.content[0].text })
}