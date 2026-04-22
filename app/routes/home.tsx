import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowBigRight, ArrowRight, LayersIcon, LucideClock1} from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/ui/Upload";
import {useNavigate} from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
    const navigate = useNavigate();
    const handleUploadComplete = async (base64Image) => {
        const newId = Date.now().toString();
        navigate(`/visualize/${newId}`);
        return true;
    };
  return (
      <div className="home">
        <Navbar />
        <section className="hero">
            <div className="announce">
                <div className="dot">
                    <div className="pulse">

                    </div>
                </div>
                <p>Introducing Stanzea v1.0</p>
            </div>
            <h1>Build beautiful spaces at the speed of thought with Stanzea</h1>
            <p className="subtitle"> Stanzea is an AI-first design environment that helps you visualize, render, and ship architectural projects faster than ever.</p>
            <div className="actions">
                <a className="cta" href="#upload">
                    Start Building <ArrowRight className="icon" />
                </a>
                <Button variant="outline" size="lg" className="demo">
                    Watch Demo
                </Button>
            </div>
            <div id="upload" className="upload-shell">
                <div className="grid-overlay" />
                <div className="upload-card">
                    <div className="upload-head">
                        <div className="upload-icon">
                            <LayersIcon className="icon" />
                        </div>
                        <h3>Upload your floor plan</h3>
                        <p>Supports JPG, PNG formats up to 10 MB</p>
                    </div>
                    <Upload onComplete={handleUploadComplete}/>
                </div>
            </div>
        </section>
          <section className="projects">
            <div className="section-inner">
                <div className="section-head">
                    <div className="copy">
                        <h2>Projects</h2>
                        <p>Your latest work and shared community projects, all in one place.</p>
                    </div>
                </div>
                <div className="projects-grid">
                    <div className="project-card group">
                        <div className="preview">
                            <img src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png" alt="project"/>
                            <div className="badge">
                                <span>
                                    Community
                                </span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div>
                                <h3>Project Milano</h3>
                                <div className="meta">
                                    <LucideClock1 size={12}/>
                                    <span>{new Date("08.05.2026").toDateString()}</span>
                                    <span>By Islam Belmerabet</span>
                                </div>
                            </div>
                            <div className="arrow">
                                <ArrowBigRight size={18}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </section>
      </div>
  );
}
