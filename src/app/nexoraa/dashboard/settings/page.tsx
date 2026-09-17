import { ApiSettings } from "@/components/admin/ApiSettings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Settings & API Keys</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {`// kelola API keys dan konfigurasi website`}
        </p>
      </div>
      <ApiSettings />
    </div>
  );
}
