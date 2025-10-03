import { FiBriefcase } from "react-icons/fi";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { LuDownload } from "react-icons/lu";
import aboutImg from "../../assets/images/about img 2.jpg";

import AboutCard from "./AboutCard";

import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 300 },
    show: { opacity: 1, y: 0 },
};

export default function About() {
    const fileUrl = "/Tenbite_Daniel_Resume.pdf";
    function handleDownload() {
        window.open(fileUrl, '_blank');
    }

    return (
        <article
            id="about"
            className="py-20 bg-blueBackground dark:bg-lighterDarkBackground"
        >
            <h2 className="text-4xl font-bold text-center dark:text-white">
                About Me
            </h2>
            <section className="w-full mt-10 flex flex-col justify-center items-center lg:flex-row gap-10">
                <img
                    src={aboutImg}
                    className="w-2/3 max-w-[350px] max-h-[100vh] rounded-xl"
                    alt="Tenbite's formal Picture"
                />
                <section className="md:w-1/2 px-12 text-lg">
                    <p className=" dark:text-white dark:text-opacity-60 text-lg text-left font-light">
                        Hi, I'm{" "}
                        <span className="text-h1 font-semibold text-opacity-100">
                            Tim
                        </span>
                        , a full-stack developer based in{" "}
                        <span className="text-h1 font-semibold text-opacity-100">
                            Ethiopia
                        </span>
                        . I build web and mobile applications that solve
                        everyday problems, using tools like{" "}
                        <span className="text-h1 font-semibold text-opacity-100">
                            JavaScript, PHP, MySQL,
                        </span>{" "}
                        and modern frontend frameworks like{" "}
                        <span className="text-h1 font-semibold text-opacity-100">
                            React and Tailwind CSS
                        </span>
                        .
                    </p>
                    <p className="mt-5 dark:text-white dark:text-opacity-60 font-light text-lg text-left">
                        I got into coding during university after realizing how
                        much impact technology can have on people's lives. I
                        enjoy working on clean, responsive designs and turning
                        ideas into real, usable solutions.
                    </p>
                    <p className="mt-5 dark:text-white dark:text-opacity-60 font-light text-lg text-left">
                        As part of my final year, I worked with a team of five
                        to develop{" "}
                        <span className="text-h1 font-semibold text-opacity-100">
                            Bertu Habesha ReHub
                        </span>{" "}
                        — a health and wellness platform that offers fitness
                        plans, nutrition guidance, rehab programs, and a
                        community forum where users can support one another.
                    </p>
                    <p className="mt-5 dark:text-white dark:text-opacity-60 text-lg font-light text-left md:text-left">
                        I'm currently open to{" "}
                        <span className="text-h1 font-semibold text-opacity-100">
                            freelance projects
                        </span>{" "}
                        or{" "}
                        <span className="text-h1 font-semibold text-opacity-100">
                            full-time roles
                        </span>{" "}
                        where I can keep growing and build with purpose. Feel
                        free to explore my work or reach out — I'm always up for
                        a meaningful challenge!
                    </p>
                    <button
                        className="group mt-5 p-3 bg-nameGradient w-[250px] rounded-xl flex justify-center items-center gap-3 text-white"
                        onClick={handleDownload}
                    >
                        <LuDownload className="text-2xl text-white" />
                        Download CV
                    </button>
                </section>
            </section>
            <motion.section
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="w-full flex flex-col lg:flex-row justify-center gap-10 px-4 mt-20 animate-scrollToTop overflow-hidden"
            >
                <section className="w-full max-w-[600px] bg-[#FBFDFF] dark:bg-[#060E22] border border-l-[5px] border-l-blue-500 dark:border-gray-800 dark:border-l-blue-500  rounded-xl p-8 flex flex-col gap-8 transform transition-transform hover:-translate-y-1 group hover:shadow-xl shadow-blue-800">
                    <h2 className="flex gap-3 items-center text-3xl font-semibold text-textColor">
                        <AcademicCapIcon className="w-12 h-12 text-textColor bg-blue-200 dark:bg-[#0B1C3D] p-2 rounded-xl group-hover:bg-blue-300 group-hover:dark:bg-[#0e214d]" />
                        Education
                    </h2>
                    <AboutCard
                        title="Bachelor of Science in Computer Science"
                        organization="Unity University"
                        enrollmentStatus="2022 - January 2026"
                        progress="Currently 4th Year Student"
                        description="Specializing in Software Engineering and Web Development.
                Completed multiple university projects and gaining hands-on
                experience with modern technologies."
                        isEducation={true}
                    />
                    <AboutCard
                        title="Full Stack Web Development Bootcamp (MERN Stack)"
                        organization="DirectEd Bootcamp"
                        enrollmentStatus="Currently Enrolled"
                        progress="In Progress"
                        description="Intensive program covering MongoDB, Express.js,
                            React, and Node.js. Working on team projects and
                            building full-stack applications."
                        isEducation={true}
                    />
                </section>
                <section className="w-full max-w-[600px] bg-[#FBFDFF] dark:bg-[#060E22] border border-l-[5px] border-l-blue-500 dark:border-gray-800 dark:border-l-blue-500  rounded-xl p-8 flex flex-col gap-8 transform transition-transform hover:-translate-y-1 group hover:shadow-xl shadow-blue-800">
                    <h2 className="flex gap-3 items-center text-3xl font-semibold text-textColor">
                        <FiBriefcase className="w-12 h-12 text-textColor bg-blue-200 dark:bg-[#0B1C3D] p-2 rounded-xl group-hover:bg-blue-300 group-hover:dark:bg-[#0e214d]" />
                        Experience
                    </h2>
                    <AboutCard
                        title="Real Estate Website Developer"
                        organization="Freelance Project"
                        projectType="Team Project"
                        description="Developed a website for a real estate sales agent as
                            part of a team. Contributed to UI/UX design,
                            frontend development, and backend implementation."
                        isEducation={false}
                    />
                    <AboutCard
                        title="University & Bootcamp Projects"
                        organization="Academic & Training Projects"
                        projectType="Ongoing"
                        description="Completed various university projects and bootcamp
                            assignments. Collaborated with teams on full-stack
                            applications using MERN stack technologies."
                        isEducation={false}
                    />
                </section>
            </motion.section>
        </article>
    );
}
