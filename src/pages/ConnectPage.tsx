import { useState } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Bot, Sparkles } from "lucide-react";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
const MCP_URL = `https://${projectRef}.supabase.co/functions/v1/mcp`;

export default function ConnectPage() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MarketingLayout>
      <section className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
            Yapay Zeka Bağlantısı
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Bu uygulamayı yapay zeka asistanınıza bağlayın
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            ChatGPT veya Claude içinden Kepez Proje Takip platformundaki
            projelerinize erişmek için aşağıdaki sunucu adresini kullanın.
          </p>
        </header>

        <Card className="p-5 md:p-6 space-y-3 bg-card/60 border-border/60">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            MCP Sunucu Adresi
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm md:text-base font-mono bg-background border border-border/60 rounded-md px-3 py-2.5 break-all">
              {MCP_URL}
            </code>
            <Button onClick={copy} size="sm" variant="secondary" className="shrink-0">
              {copied ? (
                <><Check className="w-4 h-4 mr-1.5" /> Kopyalandı</>
              ) : (
                <><Copy className="w-4 h-4 mr-1.5" /> Kopyala</>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Bağlantı sırasında bu platformdaki hesabınızla giriş yapmanız
            istenecektir. Asistan yalnızca sizin erişebildiğiniz verileri görür.
          </p>
        </Card>

        <Tabs defaultValue="claude" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
            <TabsTrigger value="claude">
              <Bot className="w-4 h-4 mr-2" /> Claude
            </TabsTrigger>
            <TabsTrigger value="chatgpt">
              <Sparkles className="w-4 h-4 mr-2" /> ChatGPT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claude">
            <Card className="p-6 space-y-4 bg-card/60 border-border/60">
              <h2 className="text-lg font-semibold">Claude Bağlantı Adımları</h2>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>
                  <a
                    className="text-accent underline underline-offset-2"
                    href="https://claude.ai/customize/connectors?modal=add-custom-connector"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Özel bağlayıcı ekleme
                  </a>{" "}
                  sayfasını açın.
                </li>
                <li>Bir ad verin ve yukarıdaki MCP adresini yapıştırın.</li>
                <li>
                  Sohbet ekranında bağlayıcıyı etkinleştirin, ardından Claude'dan
                  bu uygulamayı kullanmasını isteyin.
                </li>
              </ol>
            </Card>
          </TabsContent>

          <TabsContent value="chatgpt">
            <Card className="p-6 space-y-4 bg-card/60 border-border/60">
              <h2 className="text-lg font-semibold">ChatGPT Bağlantı Adımları</h2>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>
                  <a
                    className="text-accent underline underline-offset-2"
                    href="https://chatgpt.com/#settings/Connectors/Advanced"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ayarlar → Bağlayıcılar → Gelişmiş
                  </a>{" "}
                  sayfasını açın ve Geliştirici modunu etkinleştirin (uyarıyı okuyun).
                </li>
                <li>Sohbet ekranındaki "+" menüsünden Geliştirici modunu açın.</li>
                <li>"Kaynak ekle" &gt; "Daha fazla bağla" seçeneğine tıklayın.</li>
                <li>Bir ad verin ve yukarıdaki MCP adresini yapıştırın.</li>
                <li>ChatGPT'den bu uygulamayı kullanmasını isteyin.</li>
              </ol>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground">
          Bağlanan asistan; projelerinizi listeleyebilir, proje ayrıntılarını
          okuyabilir ve sizin adınıza proje notu ekleyebilir.
        </p>
      </section>
    </MarketingLayout>
  );
}
