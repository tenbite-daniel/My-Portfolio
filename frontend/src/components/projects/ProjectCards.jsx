import { projectsData } from "../../data/projectsData.js";
import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 300 },
    show: { opacity: 1, y: 0 },
};

export default function ProjectCards({ selectedFilters }) {
    const filteredProjects =
        selectedFilters.size === 0
            ? projectsData
            : projectsData.filter((project) =>
                  project.tech.some((tech) => selectedFilters.has(tech))
              );

    return (
        <motion.article
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 px-4 pb-20"
        >
            {filteredProjects.map((project) => (
                <section
                    key={project.id}
                    className="group bg-white dark:bg-[#030A21] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform transition duration-300 flex flex-col  ease-in-out hover:-translate-y-4"
                >
                    <img
                        src={project.image}
                        alt={`${project.title} preview`}
                        className="w-full h-52 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
                        loading="lazy"
                    />

                    <section className="p-6 flex-1 flex flex-col justify-between">
                        <section>
                            <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                                {project.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 text-md leading-relaxed">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.tech.map((tech) => (
                                    <span
                                        key={tech}
                                        className="px-3 py-2 text-xs bg-gray-200 dark:bg-gray-700 dark:text-white rounded-full"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="flex gap-4 justify-start mt-3">
                            {project.github && (
                                <a
                                    href={project.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <button 
                                        className="w-full p-2 text-xl font-semibold bg-white dark:bg-darkerDarkBackground dark:text-white px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-xl hover:bg-blue-600 hover:text-white transition"
                                        aria-label={`View ${project.title} on GitHub`}
                                    >
                                        GitHub
                                    </button>
                                </a>
                            )}
                            {project.liveLink && (
                                <a
                                    href={project.liveLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <button 
                                        className="w-full bg-nameGradient p-2 text-xl font-semibold border-none text-white rounded-xl transition"
                                        aria-label={`View ${project.title} live demo`}
                                    >
                                        Live Demo
                                    </button>
                                </a>
                            )}
                        </section>
                    </section>
                </section>
            ))}
        </motion.article>
    );
}
