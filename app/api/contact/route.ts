import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, email, countryCode, phone, subject, message, recaptchaToken } = await req.json()

    // Verify reCAPTCHA
    const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`,
    })
    const recaptchaData = await recaptchaRes.json()

    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 })
    }

    // Send to Telegram
    const text = `📬 *New Contact Form Submission*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n📞 *Phone:* ${countryCode} ${phone}\n📌 *Subject:* ${subject}\n\n💬 *Message:*\n${message}`

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!telegramRes.ok) {
      const err = await telegramRes.json()
      return NextResponse.json({ error: err.description || 'Telegram error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
