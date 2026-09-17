import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageViewTracker } from "@/components/layout/PageViewTracker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageViewTracker />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
