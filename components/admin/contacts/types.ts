export interface Reply {
  _id: string
  subject: string
  body: string
  sentAt: string
}

export interface ContactMessage {
  _id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  read: boolean
  replies: Reply[]
  createdAt: string
}

export interface Conversation {
  email: string
  name: string
  unreadCount: number
  latestAt: string
  messages: ContactMessage[]
}
