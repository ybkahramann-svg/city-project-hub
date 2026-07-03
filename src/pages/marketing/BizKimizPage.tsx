import { MarketingLayout } from '@/components/MarketingLayout';
import { Leaf, Wrench, Lightbulb } from 'lucide-react';

const BizKimizPage = () => {
  return (
    <MarketingLayout>
      <section className="px-4 py-16 md:py-24 max-w-4xl mx-auto">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-xs font-medium text-accent">
            Biz Kimiz
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Sahadan doğan bir platform
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            YBK Proje İnşaat Ltd. Şti., yıllardır peyzaj mimarisi ve altyapı projeleri alanında
            belediyeler ve kamu kurumlarıyla çalışan bir mühendislik firmasıdır.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed">
          <p>
            Onlarca kentsel dönüşüm, park, meydan ve altyapı projesinde edindiğimiz saha
            tecrübesi bize bir şeyi çok net gösterdi: kamu projelerinin en büyük sorunu inşaat
            değil, <strong className="text-accent">iletişim ve şeffaflık</strong>tı. Belediye
            başkanı sahayı göremiyor, taşeron ilerlemeyi doğru anlatamıyor, bakanlık ise
            harcanan bütçenin karşılığını tek bir raporda bulamıyordu.
          </p>

          <p>
            Bu ihtiyaç bizi mühendislikten yazılıma taşıdı. Kendi projelerimizi yönetmek için
            geliştirdiğimiz iç araçları, tüm kamu kurumlarının kullanabileceği bir platforma
            dönüştürdük. Bugün bu platform; belediyelerin, bakanlıkların, milletvekili
            ofislerinin ve taşeron firmaların ortak bir dilde konuşmasını sağlıyor.
          </p>

          <div className="grid md:grid-cols-3 gap-4 not-prose py-6">
            <div className="p-5 rounded-xl border border-border/60 bg-card">
              <Leaf className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold mb-1">Peyzaj &amp; Kentsel Tasarım</h3>
              <p className="text-sm text-muted-foreground">
                20+ yıllık saha uygulaması ve estetik altyapı tecrübesi.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-border/60 bg-card">
              <Wrench className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold mb-1">Altyapı Mühendisliği</h3>
              <p className="text-sm text-muted-foreground">
                Yol, park, meydan ve kentsel dönüşüm projelerinde uçtan uca yürütücülük.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-border/60 bg-card">
              <Lightbulb className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold mb-1">Dijital Dönüşüm</h3>
              <p className="text-sm text-muted-foreground">
                Sahadaki ihtiyaçtan doğan, karar vericilerin diliyle konuşan bir yazılım.
              </p>
            </div>
          </div>

          <p>
            Amacımız, kamu projelerinin <strong className="text-accent">şeffaf, izlenebilir
            ve paylaşılabilir</strong> hale gelmesidir. Bu platform o yolculuğun ürünüdür.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default BizKimizPage;
