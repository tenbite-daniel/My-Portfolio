export default function AboutCard(props) {
    return (
        <section className="border-l-4 border-l-blue-200 dark:border-l-blue-950 pl-5">
            <h3 className="text-contentSize font-semibold dark:text-white">
                {props.title}
            </h3>
            <h4 className="text-textColor text-contentSize font-semibold mt-2">
                {props.organization}
            </h4>
            {props.isEducation ? (
                <>
                    <p className="mt-2 opacity-60 dark:text-white text-contentSize">
                        {props.enrollmentStatus}
                    </p>
                    <p className="mt-2 opacity-60 dark:text-white text-contentSize">
                        {props.progress}
                    </p>
                </>
            ) : (
                <p className="mt-2 opacity-60 dark:text-white text-contentSize">
                    {props.projectType}
                </p>
            )}
            <p className="mt-2 opacity-60 dark:text-white text-contentSize">
                {props.description}
            </p>
        </section>
    );
}
