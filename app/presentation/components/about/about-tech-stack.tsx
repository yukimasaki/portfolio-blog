"use client";

import { PROFILE } from "@/shared/constants/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";

interface TechCategoryProps {
  readonly title: string;
  readonly items: readonly string[];
}

function TechCategory({ title, items }: TechCategoryProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Aboutページの技術スタックセクションコンポーネント
 */
export function AboutTechStack() {
  const { stacks } = PROFILE;

  return (
    <section className="mb-12">
      <Card>
        <CardHeader>
          <CardTitle>技術スタック</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TechCategory title="言語" items={stacks.languages} />
          <TechCategory title="フロントエンド" items={stacks.frontend} />
          <TechCategory title="バックエンド" items={stacks.backend} />
          <TechCategory title="インフラ" items={stacks.infra} />
          <TechCategory title="テスト" items={stacks.test} />
          <TechCategory title="ツール" items={stacks.tools} />
          {stacks.learning && stacks.learning.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">
                学習中
              </h4>
              <div className="flex flex-wrap gap-2">
                {stacks.learning.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

