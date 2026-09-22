import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;

    // Verify authenticated
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, payload } = body;

    if (action === "upsert_project") {
      const { projectData, projectId, skillIds } = payload;

      // Strip fields that may not exist in the DB schema yet
      // to prevent "column not found in schema cache" errors
      const { nda_mode: _nda, ...safeProjectData } = projectData as Record<string, unknown>;
      // Re-attach nda_mode only if the column exists — handled via try/catch below
      const dataToSave = safeProjectData;

      let targetId = projectId;
      if (projectId) {
        const { error } = await sb.from("projects").update(dataToSave).eq("id", projectId);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      } else {
        const { data, error } = await sb.from("projects").insert(dataToSave).select("id").single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        targetId = data.id;
      }

      // Try to save nda_mode separately — silently skip if column doesn't exist yet
      if (typeof _nda === "boolean" && targetId) {
        await sb.from("projects").update({ nda_mode: _nda }).eq("id", targetId).then(() => {});
      }
      
      // Sync skills if provided
      if (skillIds && Array.isArray(skillIds)) {
        // Delete old skills
        await sb.from("project_skills").delete().eq("project_id", targetId);
        // Insert new skills
        if (skillIds.length > 0) {
          const skillsToInsert = skillIds.map((sId: string) => ({
            project_id: targetId,
            skill_id: sId
          }));
          await sb.from("project_skills").insert(skillsToInsert);
        }
      }
      
      return NextResponse.json({ ok: true, id: targetId });
    }

    if (action === "insert_image") {
      const { projectId, storagePath, url } = payload;
      const { error } = await sb.from("project_images").insert({
        project_id: projectId,
        storage_path: storagePath,
        url,
        order_index: 0,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    if (action === "delete_image") {
      const { imageId, storagePath } = payload;
      // Delete from storage
      await sb.storage.from("project-images").remove([storagePath]);
      // Delete from DB
      const { error } = await sb.from("project_images").delete().eq("id", imageId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
