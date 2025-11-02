"use client";

import { cn } from "@/presentation/utils";
import { PROFILE } from "@/shared/constants/profile";

/**
 * フッターコンポーネント
 * サイト情報とリンクを含む
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
      )}
    >
      <div className="container px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {PROFILE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
