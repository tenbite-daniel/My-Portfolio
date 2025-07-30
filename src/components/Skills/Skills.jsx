import ExpertiseCard from "./ExpertiseCard";
import TechnicalSkill from "./TechnicalSkill";
import { FaCode, FaServer, FaDatabase, FaCogs } from "react-icons/fa";

export default function Skills() {
    return (
        <article
            id="skills"
            className="py-10 p-4 bg-blueBackground dark:bg-lighterDarkBackground"
        >
            <h2 className="text-center dark:text-white text-5xl font-bold mt-10">
                Expertise & Skills
            </h2>
            <p className="text-center max-w-3xl text-2xl font-light opacity-60 dark:text-white mt-10 mx-auto">
                My expertise spans across various areas of web development, with
                strong skills in both frontend and backend technologies.
            </p>
            <h3 className="text-center mt-14 text-3xl font-semibold dark:text-white">
                Areas of Expertise
            </h3>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
                <ExpertiseCard
                    icon={
                        <FaCode
                            size={50}
                            className="text-blue-500 bg-blue-100 dark:text-blue-600 dark:bg-[rgb(9,28,73)] p-2 rounded-xl mx-auto group-hover:bg-blue-200"
                        />
                    }
                    title="Frontend Development"
                    description="Creating responsive and interactive user interfaces with modern frameworks and libraries."
                />
                <ExpertiseCard
                    icon={
                        <FaServer
                            size={50}
                            className="text-blue-500 bg-blue-100 dark:text-blue-600 dark:bg-[rgb(9,28,73)] p-2 rounded-xl mx-auto group-hover:bg-blue-200"
                        />
                    }
                    title="Backend Development"
                    description="Building robust server-side applications and APIs with various technologies and frameworks."
                />
                <ExpertiseCard
                    icon={
                        <FaDatabase
                            size={50}
                            className="text-blue-500 bg-blue-100 dark:text-blue-600 dark:bg-[rgb(9,28,73)] p-2 rounded-xl mx-auto group-hover:bg-blue-200"
                        />
                    }
                    title="Database Design"
                    description="Designing and implementing efficient database schemas for optimal data management."
                />
                <ExpertiseCard
                    icon={
                        <FaCogs
                            size={50}
                            className="text-blue-500 bg-blue-100 dark:text-blue-600 dark:bg-[rgb(9,28,73)] p-2 rounded-xl mx-auto group-hover:bg-blue-200"
                        />
                    }
                    title="Full Stack Integration"
                    description="Designing and implementing efficient database schemas for optimal data management."
                />
            </section>
            <h2 className="text-3xl font-semibold text-center mt-20 dark:text-white">
                Technical Skills
            </h2>
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 mt-20 mb-10">
                <TechnicalSkill skill="HTML5" percentage={95} />
                <TechnicalSkill skill="CSS3" percentage={70} />
                <TechnicalSkill skill="JavaScript" percentage={70} />
                <TechnicalSkill skill="React" percentage={70} />
                <TechnicalSkill skill="TailwindCSS" percentage={90} />
                <TechnicalSkill skill="Node" percentage={60} />
                <TechnicalSkill skill="PHP" percentage={70} />
                <TechnicalSkill skill="MySQL" percentage={75} />
                <TechnicalSkill skill="PostgreSQL" percentage={65} />
                <TechnicalSkill skill="Git & GitHub" percentage={90} />
            </section>
        </article>
    );
}
