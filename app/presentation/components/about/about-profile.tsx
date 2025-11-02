"use client";

import { Calendar, Building2 } from "lucide-react";
import { PROFILE } from "@/shared/constants/profile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";

/**
 * Aboutページのプロフィールセクションコンポーネント
 */
export function AboutProfile() {
  if (!PROFILE.experience || PROFILE.experience.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-6">
            {PROFILE.experience.map((exp, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="flex shrink-0 mt-1">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-base">
                        {exp.period}
                      </span>
                      <span className="text-muted-foreground">
                        {exp.company}
                      </span>
                    </div>
                    {exp.role && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {exp.role}として
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-base leading-relaxed text-muted-foreground pl-6">
                    {exp.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
