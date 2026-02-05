import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const externalUrl = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const externalKey = Deno.env.get("EXTERNAL_SUPABASE_ANON_KEY");

    if (!externalUrl || !externalKey) {
      return new Response(
        JSON.stringify({
          error: "Missing Supabase credentials",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const externalDb = createClient(externalUrl, externalKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "getProjects") {
      const { data, error } = await externalDb
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "addProject" && req.method === "POST") {
      const project = await req.json();

      const { data, error } = await externalDb
        .from("projects")
        .insert([project])
        .select();

      if (error) throw error;

      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
