import { useState, useEffect } from "react";
import { AiOutlineArrowUp } from "react-icons/ai";

export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div>
            {visible && (
                <button
                    onClick={scrollToTop}
                    aria-label="back to top"
                    className=" fixed bottom-10 right-10 
        p-3 rounded-full bg-blue-600
        dark:bg-gray-800 text-white 
        shadow-lg 
        hover:bg-gray-700 
        focus:outline-none 
        focus:ring-2 focus:ring-gray-500 
        transition
        z-50"
                >
                    <AiOutlineArrowUp size={24} />
                </button>
            )}
        </div>
    );
}
