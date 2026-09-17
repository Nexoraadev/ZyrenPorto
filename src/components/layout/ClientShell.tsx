"use client";

import dynamic from "next/dynamic";

const BackgroundEffects = dynamic(
  () => import("@/components/layout/BackgroundEffects").then((mod) => mod.BackgroundEffects),
  { ssr: false }
);
const ScrollProgress = dynamic(
  () => import("@/components/layout/ScrollProgress").then((mod) => mod.ScrollProgress),
  { ssr: false }
);
const FloatingActions = dynamic(
  () => import("@/components/layout/FloatingActions").then((mod) => mod.FloatingActions),
  { ssr: false }
);
const GlitchIntro = dynamic(
  () => import("@/components/layout/GlitchIntro").then((mod) => mod.GlitchIntro),
  { ssr: false }
);
const DynamicFavicon = dynamic(
  () => import("@/components/layout/DynamicFavicon").then((mod) => mod.DynamicFavicon),
  { ssr: false }
);
const ChatBot = dynamic(
  () => import("@/components/layout/ChatBot").then((mod) => mod.ChatBot),
  { ssr: false }
);

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlitchIntro />
      <ScrollProgress />
      <DynamicFavicon />
      <BackgroundEffects />
      {children}
      <FloatingActions />
      <ChatBot />
    </>
  );
}
