import type { Metadata } from "next";
import { HideTidio } from "@/components/admin/HideTidio";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HideTidio />
      {children}
    </>
  );
}
