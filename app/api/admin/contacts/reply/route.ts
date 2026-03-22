import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { connectDB } from '@/lib/mongodb'
import { Contact } from '@/models/Contact'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { contactId, subject, body } = await req.json()
    if (!contactId || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    const contact = await Contact.findById(contactId)
    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
        <p>${body.replace(/\n/g, '<br/>')}</p>
        <br/>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#6b7280;font-size:13px">
          <strong>--- Original Message ---</strong><br/>
          <strong>From:</strong> ${contact.name} &lt;${contact.email}&gt;<br/>
          <strong>Date:</strong> ${new Date(contact.createdAt).toLocaleString()}<br/>
          <strong>Subject:</strong> ${contact.subject}<br/><br/>
          ${contact.message.replace(/\n/g, '<br/>')}
        </p>
      </div>
    `

    const result = await resend.emails.send({
      from: `Tenbite Daniel <${process.env.RESEND_FROM_EMAIL}>`,
      to: contact.email,
      subject,
      html,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 502 })
    }

    contact.replies.push({ subject, body, sentAt: new Date() })
    await contact.save()

    return NextResponse.json({ ok: true, reply: contact.replies[contact.replies.length - 1] })
  } catch (err) {
    console.error('[reply] error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
