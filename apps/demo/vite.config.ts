import { createWorkspaceViteConfig } from "../../vite.workspace";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "tilt-to-edit";
const base = process.env.GITHUB_ACTIONS ? `/${repositoryName}/` : "/";

export default createWorkspaceViteConfig(base);

