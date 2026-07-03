import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request) {
  const { customer } = await request.json()

  const prompt = `You are a sales scoring AI. Score this customer's likelihood to buy from 1 to 10.

Customer details:
- Product: ${customer.product || 'unknown'}
- Budget: ${customer.budget || 'unknown'}
- Interest level: ${customer.interest_level}
- Status: ${customer.status}
- Objection: ${customer.objection || 'none'}

Reply with ONLY a JSON object like this:
{"score": 7, "reason": "High interest but price objection"}

Nothing else. No explanation. Just the JSON.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = completion.choices[0].message.content
  const parsed = JSON.parse(text)

  return Response.json(parsed)
}