import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import validator from "validator";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Telegram bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
    });
}

const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) || [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.options("/api/send", cors());

app.get("/", (req, res) => {
    res.send("Backend is Live!");
});

function isValidName(name) {
    if (typeof name !== "string") return false;
    if (name.length < 1 || name.length > 100) return false;
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(name);
}

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: "Too many requests, please try again later.",
    },
});

function sanitize(input) {
    return input.replace(/[\r\n]/g, " ");
}

app.use("/api/send", limiter);
app.post("/api/send", async (req, res) => {
    let { name, email, subject, message, recaptchaToken } = req.body;

    name = sanitize(name);
    email = sanitize(email);
    subject = sanitize(subject);
    message = sanitize(message);

    if (!validator.isEmail(email)) {
        return res
            .status(400)
            .json({ success: false, error: "Invalid email." });
    }

    if (!isValidName(name)) {
        return res.status(400).json({ success: false, error: "Invalid name." });
    }

    if (!subject || subject.length > 100) {
        return res
            .status(400)
            .json({ success: false, error: "Invalid subject." });
    }

    if (!message || message.length > 1000) {
        return res
            .status(400)
            .json({ success: false, error: "Invalid message." });
    }

    // Check reCAPTCHA
    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    try {
        const { data } = await axios.post(verifyUrl, null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET,
                response: recaptchaToken,
            },
        });

        if (!data.success) {
            console.warn(
                `Failed reCAPTCHA attempt from IP: ${req.ip}`
            );
            return res.status(400).json({
                success: false,
                error: "reCAPTCHA verification failed. Please try again.",
            });
        }

        const telegramMessage = `📩 <b>New Portfolio Contact</b>\n\n` +
            `<b>Name:</b> ${name}\n` +
            `<b>Email:</b> ${email}\n` +
            `<b>Subject:</b> ${subject}\n` +
            `<b>Message:</b>\n${message}`;

        await sendTelegramMessage(telegramMessage);

        res.status(200).json({
            success: true,
            message: "Message sent successfully!",
        });
    } catch (error) {
        console.error("❌ Message sending failed:", error);

        res.status(500).json({
            success: false,
            error: "Internal server error. Please try again later.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
