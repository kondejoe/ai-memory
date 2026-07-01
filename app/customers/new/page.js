'use client'

import { useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewCustomerPage() {
  const [form, setForm] = useState({
    name: '', phone: '', product: '', brand: '', budget: '',
    interest_level: 'medium', objection: '', notes: '',
    follow_up_date: '', status: 'new'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.name) { setError('Name is required'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('customers').insert({
      ...form, user_id: user.id
    })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/customers') }
  }

  const inputClass = "w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
  const labelClass = "text-sm text-gray-400 mb-1 block"

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-10">
      <div className="bg-gray-900 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400">← Back</button>
        <h1 className="text-lg font-bold">New Customer</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input className={inputClass} value={form.name}
            onChange={e => update('name', e.target.value)} placeholder="Customer name" />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input className={inputClass} value={form.phone}
            onChange={e => update('phone', e.target.value)} placeholder="+256 700 000000" />
        </div>
        <div>
          <label className={labelClass}>Product</label>
          <input className={inputClass} value={form.product}
            onChange={e => update('product', e.target.value)} placeholder="e.g. Samsung TV 55 inch" />
        </div>
        <div>
          <label className={labelClass}>Brand</label>
          <input className={inputClass} value={form.brand}
            onChange={e => update('brand', e.target.value)} placeholder="e.g. Samsung" />
        </div>
        <div>
          <label className={labelClass}>Budget</label>
          <input className={inputClass} value={form.budget}
            onChange={e => update('budget', e.target.value)} placeholder="e.g. 1,500,000 UGX" />
        </div>
        <div>
          <label className={labelClass}>Interest Level</label>
          <select className={inputClass} value={form.interest_level}
            onChange={e => update('interest_level', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status}
            onChange={e => update('status', e.target.value)}>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="follow_up">Follow Up</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Objection</label>
          <input className={inputClass} value={form.objection}
            onChange={e => update('objection', e.target.value)} placeholder="e.g. Price is too high" />
        </div>
        <div>
          <label className={labelClass}>Follow-up Date</label>
          <input type="date" className={inputClass} value={form.follow_up_date}
            onChange={e => update('follow_up_date', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea className={inputClass} rows={3} value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Any extra details..." />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button onClick={handleSave} disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition">
          {loading ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </div>
  )
}