"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { XIcon } from "@/presentation/components/ui/icons/x";
import { PROFILE } from "@/shared/constants/profile";
import { Button } from "@/presentation/components/ui/button";
import { getGitHubAvatarUrl } from "@/shared/utils/github-avatar";

const iconMap = {
  x: XIcon,
  github: Github,
} as const;

/**
 * AboutページのHeroセクションコンポーネント
 */
export function AboutHero() {
  const socialLinks = PROFILE.socials.map((social) => {
    const Icon = social.icon ? iconMap[social.icon] : null;
    return { ...social, Icon };
  });

  // アバター画像URLを取得（定数設定 > GitHub > null）
  const avatarUrl = PROFILE.avatarUrl || getGitHubAvatarUrl();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 画像読み込みエラー時またはURLがnullの場合はイニシャルアバターを表示
  const showInitials = !avatarUrl || imageError;

  return (
    <section className="mb-12">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        {/* アバター */}
        {showInitials ? (
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-primary/20 bg-muted text-4xl font-bold">
            {PROFILE.name.charAt(0)}
          </div>
        ) : (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-primary/20">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <span className="text-4xl font-bold text-muted-foreground">
                  {PROFILE.name.charAt(0)}
                </span>
              </div>
            )}
            <Image
              src={avatarUrl}
              alt={PROFILE.name}
              fill
              className={`object-cover transition-opacity duration-200 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              priority
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* 名前・肩書 */}
        <div className="flex flex-1 flex-col gap-2">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            {PROFILE.name}
          </h1>
          <p className="text-lg text-muted-foreground">{PROFILE.title}</p>

          {/* SNSリンク */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            {socialLinks.map((social) => {
              const Icon = social.Icon;
              if (!Icon) return null;
              return (
                <Button
                  key={social.url}
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <Link href={social.url} target="_blank" rel="noopener noreferrer">
                    <Icon className="h-4 w-4" />
                    <span>{social.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

