const PROJECT_PREFIX = "stanzea_project_";

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({error: message, ...extra}), {
        status,
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
    });
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return user?.uuid || null;
    } catch {
        return null;
    }
}

router.post('/api/projects/save', async (request, user) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, "Authentication Failed");
        
        const body = await request.json();
        const project = body?.project;
        if (!project?.id || !project?.sourceImage) {
            return jsonError(400, "Project data incomplete");
        }

        const payload = {
            ...project,
            updatedAt: new Date().toISOString()
        };

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, "Authentication Failed");

        const key = `${PROJECT_PREFIX}${project.id}`;
        await userPuter.kv.set(key, payload);
        
        return { saved: true, id: project.id, project: payload };
    } catch (e) {
        return jsonError(500, "Failed to save project", { message: e.message || "Unknown Error" });
    }
});

router.get('/api/projects/list', async (request, user) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, "Authentication Failed");

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, "Authentication Failed");

        // List all keys starting with PROJECT_PREFIX
        const keys = await userPuter.kv.list(PROJECT_PREFIX);
        
        // Fetch all values for those keys
        const projects = await Promise.all(
            keys.map(async (key) => await userPuter.kv.get(key))
        );

        return { projects: projects.filter(p => p !== null) };
    } catch (e) {
        return jsonError(500, "Failed to list projects", { message: e.message || "Unknown Error" });
    }
});

router.get('/api/projects/get', async (request, user) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, "Authentication Failed");

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, "Authentication Failed");

        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) return jsonError(400, "Project ID is required");

        const key = `${PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, "Project not found");

        return { project };
    } catch (e) {
        return jsonError(500, "Failed to fetch project", { message: e.message || "Unknown Error" });
    }
});
