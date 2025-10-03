import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 150 },
    show: { opacity: 1, y: 0 },
};

export default function ExpertiseCard({ icon, title, description }) {
    return (
        <motion.section
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="group bg-white dark:bg-[#030A21] mt-10 dark:text-white p-10 border border-gray-800 rounded-2xl text-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-blue-950 hover:dark:shadow-gray-950 hover:shadow-sm"
        >
            {icon}
            <h3 className="dark:text-white text-xl font-semibold mt-10">
                {title}
            </h3>
            <p className="dark:text-gray-500 text-lg mt-10">{description}</p>
        </motion.section>
    );
}
