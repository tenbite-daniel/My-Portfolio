/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "Poppins", "Roboto", "sans-serif"],
            },
            colors: {
                h1: "#524EEC",
            },
            animation: {
                spin360: "spin360 0.7s ease-in-out",
            },
            keyframes: {
                spin360: {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
            },
        },
    },
    plugins: [],
};
