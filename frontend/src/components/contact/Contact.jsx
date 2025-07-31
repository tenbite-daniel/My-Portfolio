import ContactForm from "./ContactForm";
import {
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
} from "react-icons/hi";

export default function Contact() {
    return (
        <article
            id="projects"
            className="py-14 p-4 dark:bg-darkerDarkBackground"
        >
            <h2 className="text-center dark:text-white text-4xl font-bold mt-10">
                Get In Touch
            </h2>
            <p className="text-center max-w-3xl text-xl font-light opacity-60 dark:text-white mt-10 mx-auto">
                I'm always open to discussing new opportunities, interesting
                projects, or just having a chat about technology. Feel free to
                reach out!
            </p>
            <section className="w-full mt-10 flex flex-col lg:flex-row-reverse md:px-28 justify-center gap-5 items-center">
                <section className="w-full">
                    <h3 className="text-2xl font-semibold dark:text-white">
                        Contact Information
                    </h3>
                    <section className="flex items-center gap-6 p-6 mt-5 bg-[#F2F8FF] hover:bg-[#E6F1FF] dark:bg-[#121B2D] dark:text-white hover:dark:bg-[#222F44]">
                        <HiOutlineMail
                            size={50}
                            className="text-blue-600 bg-[#D3E2FC] dark:bg-[#233454] p-2 rounded-xl shrink-0"
                        />
                        <div>
                            <h4 className="text-xl">Email</h4>
                            <p className="text-lg text-gray-500">
                                tenbitedaniel60@gmail.com
                            </p>
                        </div>
                    </section>
                    <section className="flex items-center gap-6 p-6 mt-5 bg-[#F2F8FF] hover:bg-[#E6F1FF] dark:bg-[#121B2D] dark:text-white hover:dark:bg-[#222F44]">
                        <HiOutlinePhone
                            size={50}
                            className="text-blue-600 bg-[#D3E2FC] dark:bg-[#233454] p-2 rounded-xl"
                        />
                        <div>
                            <h4 className="text-xl">Phone</h4>
                            <p className="text-xl text-gray-500">
                                +251-960-696-696
                            </p>
                        </div>
                    </section>
                    <section className="flex items-center gap-6 p-6 mt-5 bg-[#F2F8FF] hover:bg-[#E6F1FF] dark:bg-[#121B2D] dark:text-white hover:dark:bg-[#222F44]">
                        <HiOutlineLocationMarker
                            size={50}
                            className="text-blue-600 bg-[#D3E2FC] dark:bg-[#233454] p-2 rounded-xl"
                        />
                        <div>
                            <h4 className="text-xl">Location</h4>
                            <p className="text-xl text-gray-500">
                                Addis Ababa, Ethiopia
                            </p>
                        </div>
                    </section>
                    <section className="group mt-10 bg-nameGradient p-6 rounded-2xl">
                        <h4 className="text-2xl text-white font-semibold">
                            Let's Work Together
                        </h4>
                        <p className="text-lg text-white mt-3">
                            I'm currently available for freelance opportunities
                            and always excited to work on interesting projects.
                        </p>
                        <p className="text-lg text-white flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-600 rounded-xl transform transition-colors duration-1000 group-hover:bg-green-400"></span>
                            Available for new projects
                        </p>
                    </section>
                </section>
                <ContactForm />
            </section>
        </article>
    );
}
