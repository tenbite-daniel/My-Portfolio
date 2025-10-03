import { LuSend } from "react-icons/lu";
import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ContactForm() {
    const recaptchaRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const recaptchaToken = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: e.target.name.value,
                    email: e.target.email.value,
                    subject: e.target.subject.value,
                    message: e.target.message.value,
                    recaptchaToken,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("Message sent successfully!");
                e.target.reset();
            } else {
                toast.error("Failed: " + (data?.error || "Unknown error"));
            }
        } catch (error) {
            console.error("❌ Frontend fetch error:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="dark:bg-[#030A21] border border-gray-200 dark:border-gray-800 p-6 mt-10 w-full rounded-3xl"
        >
            <h3 className="text-3xl font-semibold dark:text-white mt-3">
                Send a Message
            </h3>
            <p className="flex flex-col text-lg mt-4">
                <label htmlFor="name" className="font-medium dark:text-white">
                    Name
                </label>
                <input
                    type="text"
                    placeholder="Your Name"
                    name="name"
                    id="name"
                    required
                    autoFocus
                    autoComplete="on"
                    className="border border-gray-300 dark:border-gray-800 dark:bg-[#020717] rounded-xl p-2 pl-3 mt-2"
                />
            </p>
            <p className="flex flex-col text-lg mt-4">
                <label htmlFor="email" className="font-medium dark:text-white">
                    Email
                </label>
                <input
                    type="text"
                    placeholder="youremail@gmail.com"
                    name="email"
                    id="email"
                    required
                    autoComplete="on"
                    className="border border-gray-300 dark:border-gray-800 dark:bg-[#020717] rounded-xl p-2 pl-3 mt-2"
                />
            </p>
            <p className="flex flex-col text-lg mt-4">
                <label
                    htmlFor="subject"
                    className="font-medium dark:text-white"
                >
                    Subject
                </label>
                <input
                    type="text"
                    placeholder="What's this about?"
                    name="subject"
                    id="subject"
                    autoComplete="on"
                    required
                    className="border border-gray-300 dark:border-gray-800 dark:bg-[#020717] rounded-xl p-2 pl-3 mt-2"
                />
            </p>
            <p className="flex flex-col text-lg mt-4">
                <label
                    htmlFor="message"
                    className="font-medium dark:text-white"
                >
                    Message
                </label>
                <textarea
                    cols="30"
                    rows="5"
                    id="message"
                    name="message"
                    className="border border-gray-300 dark:border-gray-800 dark:bg-[#020717] rounded-xl p-2 pl-3 mt-2"
                ></textarea>
            </p>
            <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                size="invisible"
                ref={recaptchaRef}
            />
            <button 
                className="group bg-nameGradient p-3 w-full mt-4 rounded-xl flex gap-4 text-white justify-center items-center text-xl font-semibold hover:bg-nameGradiantHover"
                aria-label="Send message"
            >
                <LuSend
                    size={24}
                    className="text-white transform transition-transform group-hover:translate-x-1"
                />
                Send Message
            </button>
            <ToastContainer position="top-center" autoClose={3000} />
        </form>
    );
}
