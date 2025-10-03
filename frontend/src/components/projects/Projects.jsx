import { useState } from "react";
import ProjectCards from "./ProjectCards";
// import { motion } from "framer-motion";
// import { FcClearFilters } from "react-icons/fc";

export default function Projects() {
    const techFilters = [
        "HTML",
        "CSS",
        "JavaScript",
        "TailwindCSS",
        "React",
        "PHP",
        "Node",
        "MySQL",
        "PostgreSQL",
        "Express",
        "MongoDB",
        "JWT",
        "Framer Motion",
    ];

    const [selectedFilters, setSelectedFilters] = useState(new Set());

    function toggleFilter(tech) {
        setSelectedFilters((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(tech)) {
                newSet.delete(tech);
            } else {
                newSet.add(tech);
            }
            return newSet;
        });
    }

    function clearFilters() {
        setSelectedFilters(new Set());
    }

    const showClear = selectedFilters.size > 0;

    return (
        <article
            id="projects"
            className="pt-14 p-4 dark:bg-darkerDarkBackground"
        >
            <h2 className="text-center dark:text-white text-4xl font-bold mt-10">
                Projects
            </h2>
            <p className="text-center max-w-3xl text-xl font-light opacity-60 dark:text-white mt-10 mx-auto">
                Here are some of the projects I've worked on, showcasing my
                skills in various technologies and my ability to create
                functional, user-friendly applications.
            </p>

            <section className="w-full max-w-4xl flex flex-wrap justify-center gap-4 mt-10 mx-auto">
                {techFilters.map((tech) => (
                    <button
                        key={tech}
                        onClick={() => toggleFilter(tech)}
                        className={`px-4 py-2 rounded-full border transition-colors duration-300 ${
                            selectedFilters.has(tech)
                                ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-600"
                                : "bg-transparent text-gray-700 dark:text-gray-300 border-gray-400 hover:bg-blue-500 hover:dark:bg-gray-900 hover:text-white"
                        }`}
                    >
                        {tech}
                    </button>
                ))}
                {showClear && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300"
                    >
                        Clear Filters
                    </button>
                )}
            </section>
            <ProjectCards selectedFilters={selectedFilters} />
        </article>
    );
}
