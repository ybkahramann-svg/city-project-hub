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
  name: "add_project_note",
  title: "Proje Notu Ekle",
  description: "Bir projeye Başkan Kararları / direktif notu ekler.",
  inputSchema: {
    project_id: z.string().uuid().describe("Not eklenecek projenin UUID'si."),
    text: z.string().trim().min(1).describe("Not metni."),
    author: z.string().trim().min(1).optional().describe("Not sahibi (varsayılan: kullanıcı e-postası)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ project_id, text, author }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Kimlik doğrulaması gerekli." }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("project_notes")
      .insert({ project_id, text, author: author ?? ctx.getUserEmail() ?? "MCP" })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: "Not eklendi." }],
      structuredContent: { note: data },
    };
  },
});
