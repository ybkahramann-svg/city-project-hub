import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_project",
  title: "Proje Detayı",
  description: "Bir projenin tüm alanlarını, notlarını ve galerisini döner.",
  inputSchema: {
    project_id: z.string().uuid().describe("Proje UUID'si."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ project_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Kimlik doğrulaması gerekli." }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const [{ data: project, error: pErr }, { data: notes }, { data: gallery }] = await Promise.all([
      sb.from("projects").select("*").eq("id", project_id).maybeSingle(),
      sb.from("project_notes").select("id,author,text,created_at").eq("project_id", project_id).order("created_at", { ascending: false }),
      sb.from("project_gallery").select("id,image_url,caption,sort_order").eq("project_id", project_id).order("sort_order"),
    ]);
    if (pErr) return { content: [{ type: "text", text: pErr.message }], isError: true };
    if (!project) return { content: [{ type: "text", text: "Proje bulunamadı." }], isError: true };
    const payload = { project, notes: notes ?? [], gallery: gallery ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
