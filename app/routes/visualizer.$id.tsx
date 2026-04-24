import React, {useCallback, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router";
import {getProject} from "../../lib/puter.action";
import {generate3DView} from "../../lib/ai.action";
import {Box, Download, RefreshCcw, Share2, X} from "lucide-react";
import Button from "../../components/ui/Button";

const Visualizer = () =>{
    const navigate = useNavigate();
    const location = useLocation();
    const {initialImage, initialRender, pname} = location.state || {};
    const hasInitialGenerated = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string|null>(initialRender || null);

    const handleBack = () => navigate("/");

    const runGeneration = async () => {
        if(!initialImage) return;
        try {
            setIsProcessing(true);
            const result = await generate3DView({sourceImage: initialImage});
            if(result.renderedImage){
                setCurrentImage(result.renderedImage);
                // update the project with the rendered image

            }
        } catch (e) {
            console.error("Failed to generate image", e);
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        if (!initialImage || hasInitialGenerated.current) return;
        if (initialRender) {
            setCurrentImage(initialRender);
            hasInitialGenerated.current = true;
            return;
        }
        hasInitialGenerated.current = true;
        runGeneration();
    }, [initialImage,initialRender]);

    const params = useParams();
    const [project, setProject] = useState<DesignItem | null>(location.state || null);
    const [loading, setLoading] = useState(!location.state);

    useEffect(() => {
        if (!project && params.id) {
            getProject(params.id).then((data) => {
                setProject(data);
                setLoading(false);
            });
        }
    }, [params.id, project]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!project) {
        return <div>Project not found</div>;
    }

    const {sourceImage, name} = project;
    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="brand">
                    <Box className="logo">
                        <span className="name">
                            Stanzea
                        </span>
                        </Box>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                    <X className="icon"/> Exit Editor
                </Button>
            </nav>
            <section className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{"Untitled Project"}</h2>
                            <p className="note">Created By You</p>
                        </div>
                        <div className="panel-actions">
                            <Button size="sm" onClick={()=>{}} className="export" disabled={!currentImage}>
                                <Download className="w-4 h-4 mr-2"/> Export
                            </Button>
                            <Button size="sm" onClick={()=>{}} className="share">
                                    <Share2 className="w-4 h-4 mr-2"/> Share
                            </Button>
                        </div>
                    </div>
                    <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
                        {currentImage ?
                            (<img src={currentImage} alt="AI Render" className="render-img"/>)
                            :(
                                <div className="render-placeholder">
                                    {initialImage && (
                                        <img src={initialImage} alt="Original" className="render-fallback"/>
                                    )}
                                </div>
                            )}
                        {
                            isProcessing && (
                                <div className="render-overlay">
                                    <div className="rendering-card">
                                        <RefreshCcw className="spinner"/>
                                        <span className="title">Rendering ...</span>
                                        <span className="subtitle">Generating Your 3D Visualization...</span>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Visualizer