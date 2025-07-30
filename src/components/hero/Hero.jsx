import { useState, useEffect } from "react";
import heroImg from "../../assets/images/hero img.jpg";
import PreviewResume from "./PreviewResume";

export default function Hero() {
    const positions = [
        "Aspiring Software Engineer",
        "Full Stack Developer",
        "Web Developer",
        "Frontend Developer",
        "Backend Developer",
    ];

    const typingSpeed = 150;
    const pauseTime = 1500;
    const deletingSpeed = 100;

    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [resumeOpen, setResumeOpen] = useState(false);

    const currentText = positions[textIndex];
    const visibleText = currentText.substring(0, charIndex);

    useEffect(() => {
        let timeout;

        if (!isDeleting && charIndex <= positions[textIndex].length) {
            timeout = setTimeout(() => {
                setCharIndex(charIndex + 1);
            }, typingSpeed);
        } else if (isDeleting && charIndex >= 0) {
            timeout = setTimeout(() => {
                setCharIndex(charIndex - 1);
            }, deletingSpeed);
        } else if (charIndex > currentText.length) {
            timeout = setTimeout(() => {
                setIsDeleting(true);
                setCharIndex(charIndex - 1);
            }, pauseTime);
        } else if (charIndex < 0) {
            setIsDeleting(false);
            setTextIndex((textIndex + 1) % positions.length);
            setCharIndex(0);
        }
        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, textIndex, currentText]);

    const openPreview = () => setResumeOpen(true);
    const closePreview = () => setResumeOpen(false);

    return (
        <main
            id="hero"
            className="w-full min-h-[90vh] flex flex-col md:flex-row-reverse md:gap-2 items-center justify-evenly px-4 pt-20 md:pt-0 md:pl-32  dark:bg-darkerDarkBackground pb-10"
        >
            <div className="md:flex-1 w-full flex justify-center overflow-hidden md:mx-auto pb-6">
                <img
                    src={heroImg}
                    onLoad={(e) =>
                        e.currentTarget.classList.add("animate-slideInRight")
                    }
                    className="max-w-96 max-h-96 rounded-full shadow-lg shadow-blue-900 dark:shadow-blue-800 delay-300"
                    alt="Tenbite's Picture"
                />
            </div>
            <article className="w-full md:flex-1 text-center md:text-left animate-slideInLeft delay-300">
                <section>
                    <h1 className="text-5xl font-bold dark:text-white">
                        Hi, I'm{" "}
                        <span className="whitespace-nowrap bg-nameGradient bg-clip-text text-transparent">
                            Tenbite Daniel
                        </span>
                    </h1>
                    <h2 className="whitespace-nowrap inline-block min-h-4 text-4xl font-medium text-[#2463EB] mt-5">
                        {visibleText}
                        <span className="blinking-cursor">|</span>
                    </h2>
                    <p className="text-2xl font-normal opacity-[0.5] mt-5 dark:text-white">
                        Full Stack Developer passionate about creating modern
                        web solutions.
                    </p>
                </section>
                <section className="w-full flex flex-col gap-4 mt-5 md:flex-row">
                    <button
                        className="group w-full p-3 border-2 rounded-xl hover:bg-previewBtn dark:text-white dark:hover:bg-gray-700 dark:border-gray-700"
                        onClick={openPreview}
                    >
                        <i className="fas fa-eye me-1 mr-2 transform transition-transform duration-300 group-hover:scale-110"></i>
                        Preview
                    </button>
                    <PreviewResume isOpen={resumeOpen} onClose={closePreview} />
                    <a href="#projects" className="w-full">
                        <button className="group w-full p-3 border-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 border-none dark:text-white">
                            <i className="fas fa-briefcase mr-2 transform transition-transform duration-300 group-hover:scale-110"></i>
                            View Projects
                        </button>
                    </a>
                </section>
            </article>
        </main>
    );
}
