'use client'

import { useState, useEffect } from 'react'
import { MailOpen } from 'lucide-react'
import { MessageThread } from './contacts/message-thread'
import { ConversationList } from './contacts/conversation-list'
import type { Conversation, Reply } from './contacts/types'

export function AdminContacts({ onUnreadChange }: { onUnreadChange?: (count: number) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? conversations.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      )
    : conversations

  useEffect(() => {
    fetch('/api/admin/contacts')
      .then(r => r.json())
      .then(({ conversations }) => {
        if (conversations) {
          setConversations(conversations)
          onUnreadChange?.((conversations as Conversation[]).reduce((sum, c) => sum + c.unreadCount, 0))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [onUnreadChange])

  const handleSelect = async (conv: Conversation) => {
    setSelected(conv)
    if (conv.unreadCount > 0) {
      await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: conv.email }),
      })
      setConversations(prev => prev.map(c =>
        c.email === conv.email ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c
      ))
      onUnreadChange?.(conversations.reduce((sum, c) =>
        sum + (c.email === conv.email ? 0 : c.unreadCount), 0
      ))
    }
  }

  const handleReplySent = (msgId: string, reply: Reply) => {
    setConversations(prev => prev.map(c =>
      c.email === selected?.email
        ? { ...c, messages: c.messages.map(m => m._id === msgId ? { ...m, replies: [...m.replies, reply] } : m) }
        : c
    ))
    setSelected(prev => prev ? {
      ...prev,
      messages: prev.messages.map(m => m._id === msgId ? { ...m, replies: [...m.replies, reply] } : m)
    } : prev)
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Contacts</h2>
          {totalUnread > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-accent text-accent-foreground rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Two-panel inbox */}
      <div className="border border-border rounded-xl overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Left panel */}
          <div className={`w-full lg:w-80 flex-shrink-0 border-r border-border flex flex-col ${selected ? 'hidden lg:flex' : 'flex'}`}>
            <ConversationList
              conversations={conversations}
              filtered={filtered}
              loading={loading}
              selected={selected}
              search={search}
              onSearch={setSearch}
              onSelect={handleSelect}
            />
          </div>

          {/* Right panel */}
          <div className={`flex-1 p-4 overflow-hidden flex flex-col ${selected ? 'flex' : 'hidden lg:flex'}`}>
            {selected ? (
              <MessageThread
                key={selected.email}
                conversation={selected}
                onBack={() => setSelected(null)}
                onReplySent={handleReplySent}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <MailOpen className="w-10 h-10 opacity-20" />
                <p className="text-sm">Select a conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
