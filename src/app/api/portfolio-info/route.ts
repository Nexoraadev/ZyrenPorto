import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/portfolio-info
 * Returns all portfolio data as structured text for AI consumption.
 * n8n AI Agent can call this as an HTTP tool to get context about Zyrenn.
 */
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;

    const [
      { data: settings },
      { data: projects },
      { data: skills },
    ] = await Promise.all([
      sb.from("site_settings").select("key, value"),
      sb.from("projects")
        .select("title, description, long_description, tech_stack, live_url, github_url, featured, project_categories(name)")
        .order("order_index", { ascending: true }),
      sb.from("skills")
        .select("name, category, level")
        .order("order_index", { ascending: true }),
    ]);

    // Build settings map
    const cfg: Record<string, Record<string, unknown>> = {};
    for (const row of settings ?? []) cfg[row.key] = row.value ?? {};

    // Extract info
    const nameFirst  = (cfg.hero_name?.first    as string) ?? "Reavlenia";
    const nameLast   = (cfg.hero_name?.last     as string) ?? "Arezha";
    const roles      = (cfg.hero_roles?.roles   as string[]) ?? [];
    const bio        = (cfg.hero_bio?.text      as string) ?? "";
    const aboutParas = (cfg.about_bio?.paragraphs as string[]) ?? [];
    const contact    = cfg.contact_info as Record<string, unknown> ?? {};

    // Build plain text knowledge base
    const lines: string[] = [
      "# PORTFOLIO KNOWLEDGE BASE — REAVLENIA AREZHA (ZYRENN)",
      "",
      "## IDENTITAS",
      `Nama lengkap: ${nameFirst} ${nameLast}`,
      `Nama panggilan: Zyrenn`,
      `Profesi / Roles: ${roles.join(", ")}`,
      "",
      "## BIO SINGKAT",
      bio || "Creative multidisciplinary — web development, design, animation, illustration.",
      "",
    ];

    if (aboutParas.length > 0) {
      lines.push("## TENTANG ZYRENN");
      aboutParas.forEach(p => lines.push(p));
      lines.push("");
    }

    // Contact
    const socialLinks = contact.socialLinks as Array<{ label: string; href: string; value: string }> | undefined;
    lines.push("## KONTAK & SOSIAL MEDIA");
    if (socialLinks && socialLinks.length > 0) {
      socialLinks.forEach(l => {
        if (l.href) lines.push(`- ${l.label}: ${l.href}`);
      });
    } else {
      if (contact.email)     lines.push(`- Email: ${contact.email}`);
      if (contact.github)    lines.push(`- GitHub: ${contact.github}`);
      if (contact.instagram) lines.push(`- Instagram: ${contact.instagram}`);
      if (contact.linkedin)  lines.push(`- LinkedIn: ${contact.linkedin}`);
    }
    if (contact.location) lines.push(`- Lokasi: ${contact.location}`);
    lines.push("");

    // Skills per category
    const skillMap: Record<string, string[]> = {};
    for (const s of skills ?? []) {
      if (!skillMap[s.category]) skillMap[s.category] = [];
      skillMap[s.category].push(s.name);
    }
    lines.push("## SKILLS & TOOLS");
    for (const [cat, names] of Object.entries(skillMap)) {
      lines.push(`${cat}: ${names.join(", ")}`);
    }
    lines.push("");

    // Projects
    lines.push("## PROYEK / PORTFOLIO");
    for (const p of projects ?? []) {
      const catName = (p.project_categories as { name: string } | null)?.name ?? "";
      lines.push(`### ${p.title}${catName ? ` [${catName}]` : ""}${p.featured ? " ⭐" : ""}`);
      lines.push(p.description ?? "");
      if (p.long_description) lines.push(p.long_description);
      if (p.tech_stack?.length) lines.push(`Tech: ${p.tech_stack.join(", ")}`);
      if (p.live_url)   lines.push(`Live: ${p.live_url}`);
      if (p.github_url) lines.push(`GitHub: ${p.github_url}`);
      lines.push("");
    }

    // Footer instructions for AI
    lines.push("---");
    lines.push("INSTRUKSI UNTUK AI:");
    lines.push("Kamu adalah asisten portfolio Zyrenn (Reavlenia Arezha). Jawab pertanyaan berdasarkan data di atas.");
    lines.push("Gunakan bahasa Indonesia yang ramah dan natural. Kalau ditanya hal yang tidak ada di data, jawab jujur bahwa kamu tidak punya info tersebut.");
    lines.push("Jangan buat-buat informasi yang tidak ada di knowledge base ini.");

    const text = lines.join("\n");

    return NextResponse.json({
      owner: `${nameFirst} ${nameLast}`,
      nickname: "Zyrenn",
      roles,
      bio,
      skills: skillMap,
      projectCount: (projects ?? []).length,
      contact: {
        email:     contact.email     ?? null,
        github:    contact.github    ?? null,
        instagram: contact.instagram ?? null,
        linkedin:  contact.linkedin  ?? null,
        location:  contact.location  ?? null,
      },
      knowledgeText: text,  // full text for AI context
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
