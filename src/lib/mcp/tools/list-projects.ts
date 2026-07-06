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
  name: "list_projects",
  title: "Projeleri Listele",
  description:
    "Kullanıcının kuruluşundaki projeleri listeler. Durum, kategori, ilçe veya mahalleye göre filtrelenebilir.",
  inputSchema: {
    status: z.string().optional().describe("Proje durumu (ör. 'In Progress', 'Completed', 'Planned')."),
    category: z.string().optional().describe("Proje kategorisi."),
    district: z.string().optional().describe("İlçe adı."),
    neighborhood: z.string().optional().describe("Mahalle adı."),
    limit: z.number().int().min(1).max(200).optional().describe("Maksimum kayıt sayısı (varsayılan 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, category, district, neighborhood, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Kimlik doğrulaması gerekli." }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("projects")
      .select("id,title,status,category,district,neighborhood,budget,progress,start_date,end_date,manager_name")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (status) q = q.eq("status", status);
    if (category) q = q.eq("category", category);
    if (district) q = q.eq("district", district);
    if (neighborhood) q = q.eq("neighborhood", neighborhood);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { projects: data ?? [] },
    };
  },
});
