import type { Metadata } from "next";
import { PageHeader } from "../components/ui/Primitives";

export const metadata: Metadata = { title: "Məxfilik siyasəti — EduRate", description: "EduRate məxfilik prinsipləri." };

export default function PrivacyPage() {
  return <main id="main-content" className="route-page legal-page" tabIndex={-1}><PageHeader id="privacy-title" eyebrow="Hüquqi məlumat" title="Məxfilik siyasəti" description="Şəxsi məlumatların necə istifadə edildiyini aydın şəkildə izah edirik." /><article><h2>Toplanan məlumatlar</h2><p>EduRate yalnız hesabın, profilin və seçdiyin platforma funksiyalarının işləməsi üçün lazım olan məlumatları emal edir.</p><h2>İstifadə məqsədi</h2><p>Məlumatlar xidmətin təqdim edilməsi, təhlükəsizliyin qorunması və istifadəçi təcrübəsinin yaxşılaşdırılması üçün istifadə olunur.</p><h2>Əlaqə</h2><p>Məxfiliklə bağlı suallar üçün <a href="mailto:hello@edurate.az">hello@edurate.az</a> ünvanına yaza bilərsən.</p></article></main>;
}
