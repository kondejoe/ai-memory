'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function CustomerProfilePage() {
  const [customer, setCustomer] = useState(null)
  const [interactions, setInteractions] = useState([])
  const [note, setNote] = useState('')
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    const { data: c } = await supabase.from('customers').select('*').eq('id', id).single()
    const { data: i } = await supabase.from('interactions').select('*')
      .eq('customer_id', id).order('created_at', { ascending: false })
    setCustomer(c)
    setInteractions(i || [])
    setLoading(false)
  }

  async function addNote() {
    if (!note.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('interactions').insert({
      customer_id: id, user_id: user.id, type: 'note', content: note
    })
    setNote('')
    loadData()
  }

  async function deleteCustomer() {
    if (!confirm('Delete this customer?')) return
    await supabase.from('customers').delete().eq('id', id)
    router.push('/customers')
  }

  async function generateFollowUpMessage() {
    setAiLoading(true)
    setAiMessage('')
    const res = await fetch('/api/ai/follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer })
    })
    const data = await res.json()
    setAiMessage(data.message)
    setAiLoading(false)
  }

  const statusColors = {
    new: 'bg-blue-500', contacted: 'bg-yellow-500',
    follow_up: 'bg-purple-500', won: 'bg-green-500', lost: 'bg-red-500'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  if (!customer) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Customer not found</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-10">
      <div className="bg-gray-900 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400">← Back</button>
          <h1 className="text-lg font-bold">{customer.name}</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/customers/${id}/edit`} className="text-indigo-400 text-sm">Edit</Link>
          <button onClick={deleteCustomer} className="text-red-400 text-sm">Delete</button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full text-white ${statusColors[customer.status]}`}>
            {customer.status}
          </span>
          <span className="text-xs text-gray-500">Interest: {customer.interest_level}</span>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          {[
            ['Phone', customer.phone],
            ['Product', customer.product],
            ['Brand', customer.brand],
            ['Budget', customer.budget],
            ['Follow-up Date', customer.follow_up_date],
            ['Objection', customer.objection],
          ].map(([label, value]) => value ? (
            <div key={label}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm text-white">{value}</p>
            </div>
          ) : null)}
        </div>

        {customer.notes && (
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-white">{customer.notes}</p>
          </div>
        )}

        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-sm font-semibold text-indigo-400 mb-3">AI Follow-up Message</p>
          <button onClick={generateFollowUpMessage} disabled={aiLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-xl py-2 transition">
            {aiLoading ? 'Generating...' : '✨ Generate Message'}
          </button>
          {aiMessage && (
            <div className="mt-3 bg-gray-800 rounded-xl p-3">
              <p className="text-sm text-white">{aiMessage}</p>
              <div className="flex gap-3 mt-2">
                <button onClick={() => navigator.clipboard.writeText(aiMessage)}
                  className="text-xs text-indigo-400">Copy</button>
                <a
                  href={`https://wa.me/${customer.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(aiMessage)}`}
                  target="_blank"
                  className="text-xs text-green-400">
                  Send via WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-sm font-semibold mb-3">Add Note</p>
          <textarea
            value={note} onChange={e => setNote(e.target.value)}
            rows={2} placeholder="What happened in this interaction?"
            className="w-full bg-gray-800 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={addNote}
            className="mt-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-xl">
            Save Note
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-400 uppercase mb-3">History</p>
          <div className="space-y-2">
            {interactions.map(i => (
              <div key={i.id} className="bg-gray-900 rounded-xl p-3">
                <p className="text-sm text-white">{i.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(i.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {interactions.length === 0 && (
              <p className="text-gray-500 text-sm">No history yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}