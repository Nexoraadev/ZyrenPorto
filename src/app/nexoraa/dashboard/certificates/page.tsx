import { createClient } from "@/lib/supabase/server";
import { CertificatesManager } from "@/components/admin/CertificatesManager";
import type { Certificate } from "@/types/database";

export default async function CertificatesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("certificates")
    .select("*")
    .order("order_index", { ascending: true });

  const certs = (data ?? []) as Certificate[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Manajemen Sertifikat</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {"// upload file PDF/PPT/JPG atau hubungkan ke LinkedIn & Credly"}
        </p>
      </div>
      <CertificatesManager initialCerts={certs} />
    </div>
  );
}
