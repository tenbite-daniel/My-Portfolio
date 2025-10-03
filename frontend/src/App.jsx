import Header from "./components/Header";
import Hero from "./components/hero/Hero";
import { useEffect, lazy, Suspense } from "react";

const About = lazy(() => import("./components/about/About"));
const Projects = lazy(() => import("./components/projects/Projects"));
const Skills = lazy(() => import("./components/skills/Skills"));
const Contact = lazy(() => import("./components/contact/Contact"));
const Footer = lazy(() => import("./components/Footer"));
const BackToTop = lazy(() => import("./components/BackToTop"));

function App() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <div>
            <Header />
            <Hero />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                <About />
                <Projects />
                <Skills />
                <Contact />
                <Footer />
                <BackToTop />
            </Suspense>
        </div>
    );
}

export default App;
