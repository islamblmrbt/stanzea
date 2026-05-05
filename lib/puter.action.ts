import puter from "@heyputer/puter.js";
import {getOrCreateHostingConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl} from "./utils";

export const signIn = async () => await puter.auth.signIn();
export const signOut = () => puter.auth.signOut();
export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch (e) {
        return null;
    }
};
export const PROJECTS_KEY = "stanzea_projects";

export const createProject = async ({item, visibility = "private"}:CreateProjectParams): Promise<DesignItem | null | undefined> => {
    const projectId = item.id;
    const hosting = await getOrCreateHostingConfig();
    const hostedSource = projectId ?
        await uploadImageToHosting({hosting, url: item.sourceImage,projectId, label: "source"}) : null;
    const hostedRender = projectId && item.renderedImage ? await uploadImageToHosting({hosting, url: item.renderedImage,projectId, label: "rendered"})
        : null;
    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage)
            ? item.sourceImage
            : ''
    );
    if(!resolvedSource) {
        console.warn("Failed to host source image, skipping save.");
        return null;
    }
    const resolvedRender = hostedRender?.url ? hostedRender?.url : item.renderedImage && isHostedUrl(item.renderedImage) ? item.renderedImage : undefined;
    const {
        sourcePath:_sourcePath,
        renderedPath:_renderedPath,
        publicPath:_publicPath,
        ...rest
    } = item;
    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender
    };
    try {
        const projects = (await puter.kv.get(PROJECTS_KEY)) as DesignItem[] || [];
        await puter.kv.set(PROJECTS_KEY, [payload, ...projects]);
        return payload;
    } catch (e) {
        console.log("Failed to save project", e);
    }
}

export const getProjects = async (): Promise<DesignItem[]> => {
    try {
        return (await puter.kv.get(PROJECTS_KEY)) as DesignItem[] || [];
    } catch (e) {
        console.error("Failed to fetch projects", e);
        return [];
    }
}

export const getProject = async (id: string): Promise<DesignItem | null> => {
    try {
        const projects = await getProjects();
        return projects.find(p => p.id === id) || null;
    } catch (e) {
        console.error("Failed to fetch project", e);
        return null;
    }
}

export const updateProject = async (id: string, updates: Partial<DesignItem>): Promise<DesignItem | null> => {
    try {
        const projects = await getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return null;

        const updatedProject = { ...projects[index], ...updates };
        projects[index] = updatedProject;

        await puter.kv.set(PROJECTS_KEY, projects);
        return updatedProject;
    } catch (e) {
        console.error("Failed to update project", e);
        return null;
    }
}



