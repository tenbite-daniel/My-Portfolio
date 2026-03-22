'use client'

import { useState } from 'react'
import { Send, Clock, Phone } from 'lucide-react'
import { timeAgo } from './utils'
import { ReplyModal } from './reply-modal'
import type { ContactMessage, Reply } from './types'

interface MessageCardProps {
  msg: ContactMessage
  defaultExpanded?: boolean
  onReplySent: (msgId: string, reply: Reply) => void
}

export function MessageCard({ msg, defaultExpanded = false, onReplySent }: MessageCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [replyOpen, setReplyOpen] = useState(false)

  return (
    <div>
      {/* Card */}
      <div className={`bg-secondary border border-border rounded-lg ${expanded ? 'rounded-b-none' : ''}`}>
        {/* Clickable header */}
        <button
          onClick={() => setExpanded(p => !p)}
          className="w-full text-left p-4 hover:bg-secondary/80 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{msg.subject}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {timeAgo(msg.createdAt)}
                </span>
                {msg.phone && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" /> {msg.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {msg.replies.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {msg.replies.length} {msg.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{expanded ? '▲' : '▼'}</span>
            </div>
          </div>
          {!expanded && (
            <p className="text-sm text-muted-foreground truncate mt-2">{msg.message}</p>
          )}
        </button>

        {/* Always-visible reply button */}
        <div className="px-4 pb-3 flex justify-end">
          <button
            onClick={() => setReplyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Send className="w-3 h-3" /> Reply
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border border-t-0 border-border rounded-b-lg bg-background p-4 space-y-4">
          <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
          {msg.replies.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              {[...msg.replies].reverse().map(reply => (
                <div key={reply._id} className="ml-4 bg-accent/5 border border-accent/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-accent">You replied</p>
                    <span className="text-xs text-muted-foreground">{timeAgo(reply.sentAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Subject: {reply.subject}</p>
                  <div
                    className="text-sm text-foreground prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: reply.body }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reply modal */}
      {replyOpen && (
        <ReplyModal
          contact={msg}
          onClose={() => setReplyOpen(false)}
          onSent={reply => {
            onReplySent(msg._id, reply)
            setReplyOpen(false)
          }}
        />
      )}
    </div>
  )
}
