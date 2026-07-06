import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

type AuthorizationDetails = {
  client?: { name?: string; client_uri?: string };
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
};

// Narrow typed wrapper for the beta supabase.auth.oauth namespace.
const authOauth = (supabase.auth as unknown as {
  oauth: {
    getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
    approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
    denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  };
}).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Eksik authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/admin/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await authOauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await authOauth.approveAuthorization(authorizationId)
      : await authOauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Yetkilendirme sunucusu bir yönlendirme adresi döndürmedi.");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-xl border border-border/40 bg-card/50 p-6 text-center">
          <p className="text-sm text-destructive">Yetkilendirme isteği yüklenemedi: {error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-accent rounded-full animate-spin" />
      </main>
    );
  }

  const clientName = details.client?.name ?? "bir uygulama";

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-xl border border-border/40 bg-card/50 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{clientName} bağlantısı</h1>
            <p className="text-xs text-muted-foreground">Kepez Proje Takip MCP erişim onayı</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>{clientName}</strong> uygulamasının, sizin adınıza bu platformdaki projelere ve notlara erişmesine izin vermek üzeresiniz.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
            Reddet
          </Button>
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy ? "İşleniyor..." : "Onayla"}
          </Button>
        </div>
      </div>
    </main>
  );
}
