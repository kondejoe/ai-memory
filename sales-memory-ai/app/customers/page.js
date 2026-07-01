'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadCustomers() }, [])

  async function loadCustomers() {
    setLoading(true)
    const { data } = await supabase
      .from('customers').select('*')
      .order('created_at', { ascending: false })
    setCustomers(data || [])
    setLoading(false)
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.product && c.product.toLowerCase().includes(search.toLowerCase()))
  )

  const statusColors = {
    new: 'bg-blue-500', contacted: 'bg-yellow-500',
    follow_up: 'bg-purple-500', won: 'bg-green-500', lost: 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      <div className="bg-gray-900 px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Customers</h1>
        <Link href="/customers/new" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl">
          + Add
        </Link>
      </div>

      <div className="px-4 py-4">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, product..."
          className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="px-4 space-y-2">
        {loading && <p className="text-gray-400 text-center py-8">Loading...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 text-center py-8">No customers found</p>
        )}
        {filtered.map(c => (
          <Link key={c.id} href={`/customers/${c.id}`}
            className="block bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-400">
                  {c.phone} {c.product ? `· ${c.product}` : ''}
                </p>
                {c.follow_up_date && (
                  <p className="text-xs text-indigo-400 mt-1">
                    Follow up: {c.follow_up_date}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColors[c.status]}`}>
                {c.status}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-3 flex justify-around">
        <Link href="/dashboard" className="text-gray-400 flex flex-col items-center">
          <span className="text-xl">🏠</span>
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/customers" className="text-indigo-400 flex flex-col items-center">
          <span className="text-xl">👥</span>
          <span className="text-xs mt-1">Customers</span>
        </Link>
        <Link href="/customers/new" className="flex flex-col items-center">
          <span className="text-2xl bg-indigo-600 rounded-full w-10 h-10 flex items-center justify-center">+</span>
        </Link>
      </div>
    </div>
  )
}