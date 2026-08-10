import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubDetailExperience } from "../../components/ClubDetailExperience";
import { clubs, clubFromApi, getClubBySlug, type ClubApiRecord } from "../../data/clubs";
import { requestRemoteApi } from "../../lib/auth/remote-credential";

type ClubDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return clubs.map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: ClubDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = await loadClub(slug);

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
  const club = await loadClub(slug);

  if (!club) {
    notFound();
  }

  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <ClubDetailExperience club={club} />
    </main>
  );
}

async function loadClub(slug:string){return await requestRemoteApi<ClubApiRecord>(`/api/clubs/${encodeURIComponent(slug)}`).then(clubFromApi).catch(()=>getClubBySlug(slug)??null);}
