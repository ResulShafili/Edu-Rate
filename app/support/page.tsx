import type { Metadata } from "next";
import { SupportCenter } from "../components/SupportCenter";

export const metadata: Metadata = { alternates: { canonical: "/support" },
  title: "Dəstək — EduRate",
  description: "Tez-tez verilən suallara cavab tap və EduRate dəstək komandası ilə əlaqə saxla.",
};

export default function SupportPage() {
  return <main id="main-content" className="route-page" tabIndex={-1}><SupportCenter /></main>;
}
