'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [todayFollowUps, setTodayFollowUps] = useState([])
  const [overdueFollowUps, setOverdueFollowUps] = useState([])
  const [recentCustomers, setRecentCustomers] = useState([])
  const [loading, setLoading] = useState(true)
const [message, setMessage] = 
  useState('') const supabase = 
  createClient() const router = 
  useRouter()
const [reply, setReply] = useState('') 
  useEffect(() => {
const [sending, setSending] = useState(false)    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const today = new Date().toISOString().split('T')[0]

      const { data: todayData } = await supabase
        .from('customers').select('*')
        .eq('follow_up_date', today)
        .neq('status', 'won').neq('status', 'lost')

      const { data: overdueData } = await supabase
        .from('customers').select('*')
        .lt('follow_up_date', today)
        .neq('status', 'won').neq('status', 'lost')

      const { data: recentData } = await supabase
        .from('customers').select('*')
        .order('created_at', { ascending: false }).limit(5)

      setTodayFollowUps(todayData || [])
      setOverdueFollowUps(overdueData || [])
      setRecentCustomers(recentData || [])
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Sales Memory</h1>
          <p className="text-xs text-gray-400">
            {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">
          Logout
        </button>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-indigo-400">{todayFollowUps.length}</p>
            <p className="text-xs text-gray-400 mt-1">Today</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{overdueFollowUps.length}</p>
            <p className="text-xs text-gray-400 mt-1">Overdue</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{recentCustomers.length}</p>
            <p className="text-xs text-gray-400 mt-1">Recent</p>
          </div>
        </div>

        {todayFollowUps.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">Today's Follow-ups</h2>
            <div className="space-y-2">
              {todayFollowUps.map(c => (
                <Link key={c.id} href={`/customers/${c.id}`}
                  className="block bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-gray-400">{c.product} · {c.phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {overdueFollowUps.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-red-400 uppercase mb-3">Overdue</h2>
            <div className="space-y-2">
              {overdueFollowUps.map(c => (
                <Link key={c.id} href={`/customers/${c.id}`}
                  className="block bg-gray-900 border border-red-900 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-gray-400">{c.product} · {c.follow_up_date}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-900 text-red-300">overdue</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase">Recent Customers</h2>
            <Link href="/customers" className="text-sm text-indigo-400">See all</Link>
          </div>
          <div className="space-y-2">
            {recentCustomers.map(c => (
              <Link key={c.id} href={`/customers/${c.id}`}
                className="block bg-gray-900 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-gray-400">{c.product || 'No product'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColors[c.status]}`}>
                    {c.status}
                  </span>
                </div>
              </Link>
            ))}
            {recentCustomers.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No customers yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-3 flex justify-around">
        <Link href="/dashboard" className="text-indigo-400 flex flex-col items-center">
          <span className="text-xl">🏠</span>
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/customers" className="text-gray-400 flex flex-col items-center">
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
