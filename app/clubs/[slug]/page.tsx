import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubDetailExperience } from "../../components/ClubDetailExperience";
import { clubs, getClubBySlug } from "../../data/clubs";

type ClubDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return clubs.map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: ClubDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = getClubBySlug(slug);

  if (!club) {
    return {
      title: "Klub tapılmadı — EduRate",
    };
  }

  return {
    title: `${club.name} — EduRate`,
    description: club.description,
  };
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { slug } = await params;
  const club = getClubBySlug(slug);

  if (!club) {
    notFound();
  }

  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <ClubDetailExperience club={club} />
    </main>
  );
}
