"use client";

import Link from "next/link";
import { PROFILE } from "@/shared/constants/profile";
import { Button } from "@/presentation/components/ui/button";

/**
 * AboutページのCTAセクションコンポーネント
 */
export function AboutCTA() {
  return (
    <section className="mb-12">
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button asChild size="lg" variant="default">
          <Link href={PROFILE.cta.primary.href}>{PROFILE.cta.primary.label}</Link>
        </Button>
        {PROFILE.cta.secondary && (
          <Button asChild size="lg" variant="outline">
            <Link href={PROFILE.cta.secondary.href}>
              {PROFILE.cta.secondary.label}
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}

