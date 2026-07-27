import type { Metadata } from "next";
import { ApiExplorer } from "../components/ApiExplorer";

export const metadata: Metadata = {
  title: "API sənədləri — EduRate",
  description: "EduRate MVP REST API üçün OpenAPI sənədləri və canlı sağlamlıq testi.",
};

export default function ApiDocsPage() {
  return <ApiExplorer />;
}
