import { useEffect } from "react";

export default function PreviewResume({ isOpen, onClose }) {
    const fileUrl = "/Tenbite_Daniel_Resume.pdf";

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <article>
            <section
                className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 overflow-y-auto"
                onClick={onClose}
            >
                <section
                    className="w-full h-full bg-white rounded-lg shadow-lg max-w-5xl p-5 relative  w-full max-h-[90vh] sm:h-[90vh] overflow-hidden"
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
                        className="rounded w-full h-full min-h-[400px]"
                        style={{ minHeight: "400px" }}
                    />
                </section>
            </section>
        </article>
    );
}
