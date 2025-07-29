/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "Poppins", "Roboto", "sans-serif"],
            },
            backgroundImage: {
                nameGradient: "linear-gradient(to right, #345CEB, #7040EC)",
            },
            colors: {
                h1: "#524EEC",
                previewBtn: "#E6F1FF",
            },
            animation: {
                spin360: "spin360 0.7s ease-in-out",
                slideInLeft: "slideInLeft 1s ease-in-out",
                slideInRight: "slideInRight 1s ease-in-out",
            },
            keyframes: {
                spin360: {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
                slideInLeft: {
                    "0%": {
                        transform: "translateX(-100%)",
                        opacity: "0",
                    },
                    "100%": {
                        transform: "translateX(0)",
                        opacity: "1",
                    },
                },
                slideInRight: {
                    "0%": {
                        transform: "translateX(200%)",
                        opacity: "0",
                    },
                    "100%": {
                        transform: "translateX(0)",
                        opacity: "1",
                    },
                },
            },
        },
    },
    plugins: [import("tailwindcss-animate")],
};
