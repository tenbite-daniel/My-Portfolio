import { LuSend } from "react-icons/lu";

export default function ContactForm() {
    return (
        <form className="dark:bg-[#030A21] border border-gray-200 dark:border-gray-800 p-6 mt-10 w-full rounded-3xl">
            <h3 className="text-3xl font-semibold dark:text-white mt-3">
                Send a Message
            </h3>
            <p className="flex flex-col text-lg mt-4">
                <label for="name" className="font-medium dark:text-white">
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
                <label for="email" className="font-medium dark:text-white">
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
                <label for="subject" className="font-medium dark:text-white">
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
                <label for="message" className="font-medium dark:text-white">
                    Message
                </label>
                <textarea
                    cols="30"
                    rows="5"
                    id="messgae"
                    name="message"
                    className="border border-gray-300 dark:border-gray-800 dark:bg-[#020717] rounded-xl p-2 pl-3 mt-2"
                ></textarea>
            </p>
            <button className="group bg-nameGradient p-3 w-full mt-4 rounded-xl flex gap-4 text-white justify-center items-center text-xl font-semibold hover:bg-nameGradiantHover">
                <LuSend
                    size={24}
                    className="text-white transform transition-transform group-hover:translate-x-1"
                />
                Send Message
            </button>
        </form>
    );
}
