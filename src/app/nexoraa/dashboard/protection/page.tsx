import { ContentProtection } from "@/components/admin/ContentProtection";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Content Protection" };

export default function ProtectionPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Content Protection</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {`// kontrol proteksi konten website`}
        </p>
      </div>
      <div className="max-w-2xl">
        <ContentProtection />
      </div>
    </div>
  );
}
