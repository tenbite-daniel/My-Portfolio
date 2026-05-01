'use client'

import { Mail } from 'lucide-react'
import { timeAgo } from './utils'
import type { Conversation } from './types'

interface ConversationListProps {
  conversations: Conversation[]
  filtered: Conversation[]
  loading: boolean
  selected: Conversation | null
  search: string
  onSearch: (v: string) => void
  onSelect: (conv: Conversation) => void
}

export function ConversationList({
  conversations,
  filtered,
  loading,
  selected,
  search,
  onSearch,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inbox</p>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="px-2 py-1 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent w-48"
        />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-themed">
      {loading ? (
        <div className="space-y-1 p-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
          <Mail className="w-8 h-8 opacity-30" />
          <p className="text-sm">No messages yet</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
          <Mail className="w-8 h-8 opacity-30" />
          <p className="text-sm">No results for &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        filtered.map(conv => (
          <button
            key={conv.email}
            onClick={() => onSelect(conv)}
            className={`w-full text-left px-3 py-3 border-b border-border/50 hover:bg-secondary transition-colors ${selected?.email === conv.email ? 'bg-secondary' : ''}`}
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-accent">{conv.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                    {conv.name}
                  </p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(conv.latestAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">{conv.email}</p>
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.messages[conv.messages.length - 1]?.message}
                </p>
              </div>
            </div>
          </button>
        ))
      )}
      </div>
    </div>
  )
}
