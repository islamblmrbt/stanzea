import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowBigRight, ArrowRight, LayersIcon, LucideClock1} from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/ui/Upload";
import {useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {createProject, getProjects} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const isCreatingProjectRef = useRef(false);

    useEffect(() => {
        const fetchProjects = async () => {
            const items = await getProjects();

            setProjects(items)
        }

        fetchProjects();
    }, []);

    const handleUploadComplete = async (base64Image: string) => {
        try {
            if(isCreatingProjectRef.current) return false;
            isCreatingProjectRef.current = true;
            const newId = Date.now().toString();
            const name = `Residence ${newId}`;

            const newItem = {
                id: newId, name, sourceImage: base64Image,
                renderedImage: undefined,
                timestamp: Date.now()
            }

            const saved = await createProject({ item: newItem, visibility: 'private' });

            if(!saved) {
                console.error("Failed to create project");
                return false;
            }

            setProjects((prev) => [saved, ...prev]);

            navigate(`/visualize/${newId}`, {
                state: {
                    initialImage: saved.sourceImage,
                    initialRendered: saved.renderedImage || null,
                    name
                }
            });
            return true;
        } finally {
            isCreatingProjectRef.current = false;
        }
    }
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
                    <Upload onComplete={handleUploadComplete} />
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
                    {projects.map((project)=> (
                        <div key={project.id} className="project-card group" onClick={() => {
                            navigate(`/visualize/${project.id}`, {
                                state: project
                            });
                        }}>
                            <div className="preview">
                            <img src={project.renderedImage || project.sourceImage} alt="project"/>
                            <div className="badge">
                                <span>Community</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div>
                                <h3>{project.name}</h3>
                                <div className="meta">
                                    <LucideClock1 size={12}/>
                                    <span>{new Date(project.timestamp).toDateString()}</span>
                                    <span>By Islam Belmerabet</span>
                                </div>
                            </div>
                            <div className="arrow">
                                 <ArrowBigRight size={18}/>
                            </div>
                        </div>
                    </div>))}
                </div>
            </div>
          </section>
      </div>
  );
}
