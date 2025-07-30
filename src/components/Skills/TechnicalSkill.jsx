import { motion } from "framer-motion";

export default function TechnicalSkill({ skill, percentage }) {
    const radius = 80;
    const stroke = 15;
    const normalizedRadius = radius - stroke * 0.5;
    const circumfrance = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumfrance - (percentage / 100) * circumfrance;

    const fadeInUp = {
        hidden: { opacity: 0, y: 150 },
        show: { opacity: 1, y: 0 },
    };
    return (
        <motion.section
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-2"
        >
            <motion.svg
                height={radius * 2}
                width={radius * 2}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, amount: 0.5 }}
            >
                <circle
                    className="dark:text-[#0F1729] text-white"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <motion.circle
                    className="dark:text-[#2463EB] text-[#2463EB]"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeDasharray={circumfrance}
                    initial={{ strokeDashoffset: circumfrance }}
                    whileInView={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    viewport={{ once: true }}
                />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="1.5rem"
                    className="dark:text-white font-bold"
                    fill="currentColor"
                >
                    {percentage}%
                </text>
            </motion.svg>
            <h3 className="dark:text-white text-lg font-semibold">{skill}</h3>
        </motion.section>
    );
}
