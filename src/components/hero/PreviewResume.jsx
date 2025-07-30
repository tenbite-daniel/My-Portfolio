export default function PreviewResume({ isOpen, onClose }) {
    const fileUrl = "/Tenbite_Daniel_Resume.pdf";

    if (!isOpen) return null;

    return (
        <article>
            <section
                className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
                onClick={onClose}
            >
                <section
                    className="w-full h-full bg-white rounded-lg shadow-lg max-w-5xl max-h-[100vh] p-5 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute -top-1 right-1 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                        aria-label="Close Preview"
                    >
                        &times;
                    </button>

                    <iframe
                        src={fileUrl}
                        title="Resume Preview"
                        width="100%"
                        height="100%"
                        className="rounded"
                    />
                </section>
            </section>
        </article>
    );
}
