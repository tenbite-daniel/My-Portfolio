import {
    AiOutlineGithub,
    AiOutlineLinkedin,
    AiOutlineMail,
} from "react-icons/ai";
import { TbBrandTelegram } from "react-icons/tb";

export default function Footer() {
    const navLinks = (
        <>
            <a href="#hero" className="text-xl hover:text-h1">
                Home
            </a>
            <a href="#about" className="text-xl hover:text-h1">
                About
            </a>
            <a href="#projects" className="text-xl hover:text-h1">
                Projects
            </a>
            <a href="#skills" className="text-xl hover:text-h1">
                Skills
            </a>
            <a href="#contact" className="text-xl hover:text-h1">
                Contact
            </a>
        </>
    );

    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-10 p-4 bg-blueBackground dark:bg-lighterDarkBackground">
            <section className="flex flex-col lg:flex-row justify-evenly gap-4 mt-10">
                <section>
                    <h1 className="text-3xl font-bold text-textColor">
                        Tenbite Daniel
                    </h1>
                    <p className="text-xl text-gray-400 mt-5 max-w-md">
                        A passionate Full Stack Developer dedicated to creating
                        innovative web solutions with modern technologies and
                        best practices.
                    </p>
                    <section className="flex gap-5 mt-5">
                        <a
                            href="https://github.com/tenbite-daniel"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-black"
                        >
                            <AiOutlineGithub className="text-5xl text-blue-600 bg-blue-200 dark:bg-gray-800 rounded-xl p-2 hover:bg-blue-300 hover:dark:bg-gray-700" />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/tenbite-daniel-568954281"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-700"
                        >
                            <AiOutlineLinkedin className="text-5xl text-blue-600 bg-blue-200 dark:bg-gray-800 rounded-xl p-2 hover:bg-blue-300 hover:dark:bg-gray-700" />
                        </a>
                        <a
                            href="mailto:tenbitedaniel60@gmail.com"
                            className="hover:text-red-500"
                        >
                            <AiOutlineMail className="text-5xl text-blue-600 bg-blue-200 dark:bg-gray-800 rounded-xl p-2 hover:bg-blue-300 hover:dark:bg-gray-700" />
                        </a>
                        <a
                            href="https://t.me/Tim2911"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-sky-500"
                        >
                            <TbBrandTelegram className="text-5xl text-blue-600 bg-blue-200 dark:bg-gray-800 rounded-xl p-2 hover:bg-blue-300 hover:dark:bg-gray-700" />
                        </a>
                    </section>
                </section>
                <section>
                    <h2 className="text-xl font-semibold dark:text-white mt-5">
                        Quick Links
                    </h2>
                    <nav
                        className="flex flex-col gap-2 text-lg text-gray-400 mt-2"
                        aria-label="footer menu"
                    >
                        {navLinks}
                    </nav>
                </section>
                <section>
                    <h2 className="text-xl font-semibold dark:text-white mt-4">
                        Get in Touch
                    </h2>
                    <p className="text-gray-400 mt-2 text-lg">
                        tenbitedaniel60@gmail.com
                    </p>
                    <p className="text-gray-400 mt-2 text-lg">
                        +251-967-606-906
                    </p>
                    <p className="text-gray-400 mt-2 text-lg">
                        Addis Ababa, Ethiopia
                    </p>
                </section>
            </section>
            <section className="mt-14">
                <hr className="bg-gray-300 dark:bg-gray-700 h-[1px] border-none mb-10 border-0" />
                <p className="text-center text-gray-400">
                    &copy; {currentYear} Tenbite Daniel. All rights reserved.
                </p>
            </section>
        </footer>
    );
}
