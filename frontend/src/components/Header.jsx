import { useState, useEffect } from "react";

export default function Header() {
    const [isDark, setIsDark] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    function toggleDarkMode() {
        const html = document.documentElement;
        html.classList.toggle("dark");
        const isDarkNow = html.classList.contains("dark");
        setIsDark(isDarkNow);

        if (isDarkNow) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    }

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const html = document.documentElement;

        if (
            savedTheme === "dark" ||
            (!savedTheme &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            html.classList.add("dark");
            setIsDark(true);
        } else {
            html.classList.remove("dark");
            setIsDark(false);
        }
    }, []);

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

    return (
        <header className="w-full sticky top-0 left-0 bg-white dark:bg-darkerDarkBackground shadow-md p-5 z-50">
            <div className="w-full flex justify-between px-10">
                <h1 className="text-h1 text-3xl font-bold">My Portfolio</h1>
                {/* Desktop Menu */}
                <nav
                    className="hidden md:flex gap-14 dark:text-white"
                    aria-label="desktop"
                >
                    {navLinks}
                </nav>
                <div className="flex gap-4">
                    <button
                        onClick={toggleDarkMode}
                        className="text-xl dark:text-white"
                    >
                        {isDark ? (
                            <i class="fa-regular fa-sun"></i>
                        ) : (
                            <i class="fa-regular fa-moon"></i>
                        )}
                    </button>
                    {/* Mobile Humburger Menu */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-xl dark:text-white md:hidden"
                    >
                        {isOpen ? (
                            <i class="fa-solid fa-xmark animate-spin360"></i>
                        ) : (
                            <i className="fas fa-bars text-xl" />
                        )}
                    </button>
                </div>
            </div>
            {/* Mobile Menu */}
            {isOpen && (
                <nav
                    className="md:hidden bg-white dark:bg-gray-900 dark:text-white px-4 py-2 mt-4 flex flex-col justify-center items-center gap-5 p-5"
                    aria-label="mobile"
                >
                    {navLinks}
                </nav>
            )}
        </header>
    );
}
