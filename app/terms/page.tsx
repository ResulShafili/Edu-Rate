import type { Metadata } from "next";
import { PageHeader } from "../components/ui/Primitives";

export const metadata: Metadata = { title: "İstifadə şərtləri — EduRate", description: "EduRate platformasından istifadə qaydaları." };

export default function TermsPage() {
  return <main id="main-content" className="route-page legal-page" tabIndex={-1}><PageHeader id="terms-title" eyebrow="Hüquqi məlumat" title="İstifadə şərtləri" description="Platformadan hörmətli və təhlükəsiz istifadə üçün əsas qaydalar." /><article><h2>Hesab təhlükəsizliyi</h2><p>Hesab məlumatlarını qorumaq və icazəsiz istifadəyə yol verməmək istifadəçinin məsuliyyətidir.</p><h2>İcma qaydaları</h2><p>Rəylər və mesajlar konkret təcrübəyə əsaslanmalı, şəxsi hücum və ayrı-seçkilik ehtiva etməməlidir.</p><h2>Məzmun və moderasiya</h2><p>Təhlükəsizlik qaydalarını pozan məzmun yoxlanıla, məhdudlaşdırıla və ya silinə bilər.</p></article></main>;
}
