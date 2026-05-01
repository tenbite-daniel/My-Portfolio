'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Send, Loader2, X, Clock, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { RichEditor } from './rich-editor'
import { timeAgo } from './utils'
import type { ContactMessage, Reply } from './types'

interface ReplyModalProps {
  contact: ContactMessage
  onClose: () => void
  onSent: (reply: Reply) => void
}

export function ReplyModal({ contact, onClose, onSent }: ReplyModalProps) {
  const [subject, setSubject] = useState(`Re: ${contact.subject}`)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!body.trim() || body === '<p></p>') { toast.error('Reply body is required'); return }
    setSending(true)
    const res = await fetch('/api/admin/contacts/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: contact._id, subject, body }),
    })
    if (res.ok) {
      const { reply } = await res.json()
      toast.success('Reply sent')
      onSent(reply)
      onClose()
    } else {
      const { error } = await res.json()
      toast.error(error || 'Failed to send reply')
    }
    setSending(false)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <p className="text-sm font-semibold text-foreground">Reply to {contact.name}</p>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-themed p-4 space-y-4">
          {/* Original message preview */}
          <div className="bg-secondary border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original message</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {timeAgo(contact.createdAt)}
                </span>
                {contact.phone && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" /> {contact.phone}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs font-medium text-foreground">{contact.subject}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{contact.message}</p>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Rich text editor */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Message</label>
            <RichEditor onChange={setBody} placeholder="Write your reply..." />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
