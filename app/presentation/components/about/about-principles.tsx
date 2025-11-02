"use client";

import { Check } from "lucide-react";
import { PROFILE } from "@/shared/constants/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { cn } from "@/presentation/utils";

/**
 * Aboutページの価値観・開発哲学セクションコンポーネント
 */
export function AboutPrinciples() {
  return (
    <section className="mb-12">
      <Card>
        <CardHeader>
          <CardTitle>価値観・開発哲学</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {PROFILE.principles.map((principle, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0 text-primary",
                    "rounded-full bg-primary/10 p-1"
                  )}
                  aria-hidden="true"
                />
                <span className="text-base leading-relaxed">{principle}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

