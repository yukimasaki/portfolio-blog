"use client";

import Link from "next/link";
import { PROFILE } from "@/shared/constants/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Badge } from "@/presentation/components/ui/badge";

/**
 * Aboutページの代表的な成果セクションコンポーネント
 */
export function AboutHighlights() {
  if (PROFILE.highlights.length === 0) return null;

  return (
    <section className="mb-12">
      <Card>
        <CardHeader>
          <CardTitle>代表的な成果・取り組み</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROFILE.highlights.map((highlight, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="flex-1 text-sm text-muted-foreground">
                    {highlight.description}
                  </p>
                  {highlight.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {highlight.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={highlight.link.href}>{highlight.link.label}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

