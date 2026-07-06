import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProjects from "./tools/list-projects";
import getProject from "./tools/get-project";
import addProjectNote from "./tools/add-project-note";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "kepez-projeler-mcp",
  title: "Kepez Proje Takip MCP",
  version: "0.1.0",
  instructions:
    "Kepez Belediyesi proje takip platformu için araçlar. Kullanıcının kuruluşuna ait projeleri listelemek, ayrıntıları görmek ve proje notu eklemek için kullanın.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProjects, getProject, addProjectNote],
});
