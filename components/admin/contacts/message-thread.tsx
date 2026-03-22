'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, MailOpen, ArrowDown } from 'lucide-react'
import { MessageCard } from './message-card'
import type { ContactMessage, Conversation, Reply } from './types'

const PAGE_SIZE = 10

interface MessageThreadProps {
  conversation: Conversation
  onBack: () => void
  onReplySent: (msgId: string, reply: Reply) => void
}

export function MessageThread({ conversation, onBack, onReplySent }: MessageThreadProps) {
  const [allMessages, setAllMessages] = useState<ContactMessage[]>([])
  const [page, setPage] = useState(1)
  const [showScrollToLatest, setShowScrollToLatest] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAllMessages([...conversation.messages])
    setPage(1)
  }, [conversation.messages])

  const visible = allMessages.slice(Math.max(0, allMessages.length - page * PAGE_SIZE))
  const hasMore = allMessages.length > page * PAGE_SIZE

  const scrollToLatest = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => { setTimeout(scrollToLatest, 50) }, [conversation.email, scrollToLatest])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowScrollToLatest(el.scrollHeight - el.scrollTop - el.clientHeight > el.clientHeight * 0.5)
    if (el.scrollTop < 80 && hasMore) {
      const prevHeight = el.scrollHeight
      setPage(p => p + 1)
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevHeight
        }
      })
    }
  }, [hasMore])

  const handleReplySent = useCallback((msgId: string, reply: Reply) => {
    setAllMessages(prev => prev.map(m => m._id === msgId ? { ...m, replies: [...m.replies, reply] } : m))
    onReplySent(msgId, reply)
    setTimeout(scrollToLatest, 50)
  }, [onReplySent, scrollToLatest])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border flex-shrink-0">
        <button onClick={onBack} className="lg:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-accent">{conversation.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{conversation.name}</p>
          <p className="text-xs text-muted-foreground truncate">{conversation.email}</p>
        </div>
      </div>

      {/* Scrollable messages */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto scrollbar-themed space-y-3 pr-1"
        >
          {hasMore && (
            <div className="flex justify-center py-2">
              <span className="text-xs text-muted-foreground animate-pulse">Loading older messages...</span>
            </div>
          )}

          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <MailOpen className="w-8 h-8 opacity-20" />
              <p className="text-sm">No messages</p>
            </div>
          ) : (
            visible.map((msg, i) => (
              <MessageCard
                key={msg._id}
                msg={msg}
                defaultExpanded={i === visible.length - 1}
                onReplySent={handleReplySent}
              />
            ))
          )}
        </div>

        {showScrollToLatest && (
          <button
            onClick={scrollToLatest}
            className="absolute bottom-2 right-2 p-2 bg-accent text-accent-foreground rounded-full shadow-lg hover:opacity-90 transition-opacity"
            title="Scroll to latest"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
