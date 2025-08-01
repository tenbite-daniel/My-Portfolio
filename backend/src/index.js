import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import axios from "axios";
import validator from "validator";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL.split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["POST"],
  })
);

app.use(express.json());

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

        if (!data.success || data.score < 0.5) {
            console.warn(
                `Failed reCAPTCHA attempt from IP: ${req.ip} with score: ${data.score}`
            );
            return res.status(400).json({
                success: false,
                error: "reCAPTCHA verification failed. Please try again.",
            });
        }

        const mailContent = `📩 New Message from Portfolio Contact Form
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
        `;
        // Send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: process.env.MAIL_USER,
            subject: `Portfolio Contact: ${subject}`,
            text: mailContent,
            replyTo: email,
        });

        res.status(200).json({
            success: true,
            message: "Email sent successfully!",
        });
    } catch (error) {
        console.error("❌ Email sending failed:", error);

        res.status(500).json({
            success: false,
            error: "Internal server error. Please try again later.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
