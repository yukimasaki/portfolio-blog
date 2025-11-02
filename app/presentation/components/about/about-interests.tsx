"use client";

import { PROFILE } from "@/shared/constants/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";

interface InterestSectionProps {
  readonly title: string;
  readonly items: readonly string[];
  readonly variant?: "default" | "outline";
}

function InterestSection({ title, items, variant = "default" }: InterestSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Aboutページの興味・関心セクションコンポーネント
 */
export function AboutInterests() {
  const { interests } = PROFILE;

  return (
    <section className="mb-12">
      <Card>
        <CardHeader>
          <CardTitle>興味・関心ごと</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InterestSection title="Now（今取り組んでいること）" items={interests.now} />
          <InterestSection
            title="Next（これから深掘りしたいこと）"
            items={interests.next}
            variant="outline"
          />
          <InterestSection
            title="Later（そのうち試してみたいこと）"
            items={interests.later}
            variant="outline"
          />
        </CardContent>
      </Card>
    </section>
  );
}

