import Header from "./components/Header";
import Hero from "./components/hero/Hero";
import About from "./components/about/About";
import Projects from "./components/projects/Projects";
import Skills from "./components/skills/Skills";
import Contact from "./components/contact/Contact";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import { useEffect } from "react";

function App() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <div>
            <Header />
            <Hero />
            <About />
            <Projects />
            <Skills />
            <Contact />
            <Footer />

            <BackToTop />
        </div>
    );
}

export default App;
