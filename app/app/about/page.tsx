import type { Metadata } from "next";
import {
  AboutHero,
  AboutProfile,
  AboutTechStack,
  AboutInterests,
  AboutHighlights,
  AboutPrinciples,
  AboutCTA,
} from "@/presentation/components/about";

export const metadata: Metadata = {
  title: "自己紹介",
  description: "Webアプリケーション開発者としてのプロフィール",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* HERO / 概要 */}
      <AboutHero />

      {/* プロフィール（要約） */}
      <AboutProfile />

      {/* 技術スタック */}
      <AboutTechStack />

      {/* 興味・関心 (Now/Next/Later) */}
      <AboutInterests />

      {/* 代表的な成果・取り組み */}
      <AboutHighlights />

      {/* 価値観・開発哲学 */}
      <AboutPrinciples />

      {/* CTA */}
      <AboutCTA />
    </div>
  );
}

