import { HeroSection }     from "@/components/sections/HeroSection";
import { createClient }    from "@/lib/supabase/server";
import type { ProjectWithRelations, Skill, Certificate } from "@/types/database";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const AboutSection = dynamic(() => import("@/components/sections/AboutSection").then(mod => mod.AboutSection));
const SkillsSection = dynamic(() => import("@/components/sections/SkillsSection").then(mod => mod.SkillsSection));
const ProjectsSection = dynamic(() => import("@/components/sections/ProjectsSection").then(mod => mod.ProjectsSection));
const CertificatesSection = dynamic(() => import("@/components/sections/CertificatesSection").then(mod => mod.CertificatesSection));
const ContactSection = dynamic(() => import("@/components/sections/ContactSection").then(mod => mod.ContactSection));

export default async function Home() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const [{ data: projectsData }, { data: skillsData }, { data: certsData }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, project_categories(*), project_images(id, url, storage_path, order_index)")
      .eq("featured", true)
      .order("order_index", { ascending: true })
      .limit(6),
    supabase.from("skills").select("*").order("order_index", { ascending: true }),
    supabase.from("certificates").select("*").order("order_index", { ascending: true }),
  ]);

  // Fetch all site settings
  const keys = ["hero_name","hero_roles","hero_bio","hero_stats","hero_image","about_bio","about_stats","about_traits","about_profile","about_personality","contact_info","skills_heading"];
  const { data: settingsRows } = await sb.from("site_settings").select("key,value").in("key", keys);
  const cfg: Record<string, Record<string, unknown>> = {};
  for (const row of settingsRows ?? []) cfg[row.key] = row.value ?? {};

  const heroImageUrl: string   = (cfg.hero_image?.url    as string)   ?? "";
  const heroRoles:    string[] = (cfg.hero_roles?.roles  as string[]) ?? [];
  const heroFirst:    string   = (cfg.hero_name?.first   as string)   ?? "REAVLENIA";
  const heroLast:     string   = (cfg.hero_name?.last    as string)   ?? "AREZHA";
  const heroBio:      string   = (cfg.hero_bio?.text     as string)   ?? "";
  const heroStats    = (cfg.hero_stats?.items    as { value: string; label: string }[])          ?? [];
  const aboutParas   = (cfg.about_bio?.paragraphs as string[])                                   ?? [];
  const aboutStats   = (cfg.about_stats?.items   as { value: string; label: string }[])          ?? [];
  const aboutTraits  = (cfg.about_traits?.items  as { icon: string; title: string; desc: string }[]) ?? [];
  const aboutProfile = (cfg.about_profile as Record<string, string>) ?? {};
  const aboutPersonality = (cfg.about_personality?.tags as string[]) ?? [];
  const contactInfo  = (cfg.contact_info as Record<string, unknown>) ?? {};
  const contactData = {
    socialLinks:     (contactInfo.socialLinks as import("@/components/sections/ContactSection").SocialLink[]) ?? undefined,
    location:        (contactInfo.location      as string)  ?? "Indonesia",
    mapsUrl:         (contactInfo.mapsUrl       as string)  ?? "",
    showLocation:    (contactInfo.showLocation  as boolean) !== false,
    showMaps:        (contactInfo.showMaps      as boolean) === true,
    headingLabel:    (contactInfo.headingLabel   as string) ?? undefined,
    headingMain:     (contactInfo.headingMain    as string) ?? undefined,
    headingAccent:   (contactInfo.headingAccent  as string) ?? undefined,
    headingSubtitle: (contactInfo.headingSubtitle as string) ?? undefined,
  };
  const skillsHeading = (cfg.skills_heading as Record<string, string>)                           ?? {};

  const projects = ((projectsData ?? []) as ProjectWithRelations[]).map((p) => ({
    ...p,
    project_images:     p.project_images     ?? [],
    project_categories: p.project_categories ?? { id: "", name: "—", order_index: 0 },
  }));
  const skills = (skillsData ?? []) as Skill[];
  const certificates = (certsData ?? []) as Certificate[];

  const SectionFallback = () => <div style={{ minHeight: "40px" }} aria-hidden="true" />;

  return (
    <>
      <HeroSection
        heroImageUrl={heroImageUrl}
        roles={heroRoles}
        nameFirst={heroFirst}
        nameLast={heroLast}
        bio={heroBio}
        stats={heroStats}
      />

      <Suspense fallback={<SectionFallback />}>
        <ProjectsSection projects={projects} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <AboutSection paragraphs={aboutParas} aboutStats={aboutStats} traits={aboutTraits} profile={aboutProfile} personalityTags={aboutPersonality} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <SkillsSection skills={skills} heading={skillsHeading} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <CertificatesSection certificates={certificates} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ContactSection contactData={contactData} contactInfo={contactInfo as Record<string, string>} />
      </Suspense>
    </>
  );
}
