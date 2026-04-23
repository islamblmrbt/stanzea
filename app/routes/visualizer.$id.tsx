import React, {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router";
import {getProject} from "../../lib/puter.action";

const Visualizer = () =>{
    const location = useLocation();
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
        <section>
            <h1>
                {name || "Untitled Project"}
            </h1>
            <div className="visualizer">
                {
                    sourceImage && (
                        <div className="image-container">
                            <h2>Source Image</h2>
                            <img src={sourceImage} alt="source" />
                        </div>
                    )
                }
            </div>
        </section>
    )
}

export default Visualizer