/**
 * プロフィール情報の定数定義
 * WordPress APIから取得せず、定数として管理して自由なレイアウトを実現
 */

export interface SocialLink {
  readonly label: string;
  readonly url: string;
  readonly icon?: "x" | "github";
}

export interface TechStack {
  readonly languages: readonly string[];
  readonly frontend: readonly string[];
  readonly backend: readonly string[];
  readonly infra: readonly string[];
  readonly test: readonly string[];
  readonly tools: readonly string[];
  readonly learning?: readonly string[];
}

export interface Interests {
  readonly now: readonly string[];
  readonly next: readonly string[];
  readonly later: readonly string[];
}

export interface Highlight {
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly link: {
    readonly href: string;
    readonly label: string;
  };
}

export interface Profile {
  readonly name: string;
  readonly title: string;
  readonly tagline: string;
  readonly avatarUrl?: string;
  readonly socials: readonly SocialLink[];
  readonly summary: readonly string[];
  readonly principles: readonly string[];
  readonly stacks: TechStack;
  readonly interests: Interests;
  readonly highlights: readonly Highlight[];
  readonly workStyle: {
    readonly can: readonly string[];
    readonly cannot?: readonly string[];
    readonly preferred: readonly string[];
  };
  readonly faq?: ReadonlyArray<{
    readonly q: string;
    readonly a: string;
  }>;
  readonly cta: {
    readonly primary: {
      readonly label: string;
      readonly href: string;
    };
    readonly secondary?: {
      readonly label: string;
      readonly href: string;
    };
  };
}

/**
 * プロフィール情報のデフォルト値
 * 実際の値は後で更新してください
 */
export const PROFILE: Profile = {
  name: "Yuki Masaki",
  title: "Webアプリケーションエンジニア",
  tagline: "技術とデザインで価値を創造する",
  avatarUrl: undefined,
  socials: [
    { label: "GitHub", url: "https://github.com/ftsmasaki", icon: "github" },
  ],
  summary: [
    "関数型プログラミングとクリーンアーキテクチャを重視した開発",
    "保守性とテスタビリティの高いコードベースの構築",
    "モダンなUI/UXを提供するWebアプリケーション開発",
  ],
  principles: [
    "関数型プログラミングによる純粋関数の使用",
    "クリーンアーキテクチャによるレイヤー分離",
    "bulletproof-reactによる機能別ディレクトリ構造",
    "型安全性を重視したTypeScript開発",
    "テスト可能な設計の徹底",
  ],
  stacks: {
    languages: ["TypeScript", "JavaScript", "Python"],
    frontend: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "shadcn/ui",
      "framer-motion",
    ],
    backend: ["Node.js", "Hono", "Next.js API Routes"],
    infra: ["Vercel", "GitHub Actions"],
    test: ["Vitest", "Testing Library"],
    tools: ["ESLint", "Prettier", "Git", "Docker"],
    learning: ["Rust", "Go"],
  },
  interests: {
    now: ["関数型ドメインモデリング", "クリーンアーキテクチャ", "TypeScript"],
    next: ["RustでのWebアプリケーション開発", "パフォーマンス最適化"],
    later: ["分散システム", "マイクロサービスアーキテクチャ"],
  },
  highlights: [
    {
      title: "ポートフォリオブログサイト",
      description:
        "関数型プログラミングとクリーンアーキテクチャを採用したNext.jsベースのポートフォリオブログサイト",
      tags: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
      link: {
        href: "/blog",
        label: "ブログを見る",
      },
    },
  ],
  workStyle: {
    can: [
      "Webアプリケーション開発（フロントエンド・バックエンド）",
      "関数型プログラミングによる設計",
      "型安全なコードベースの構築",
    ],
    preferred: [
      "要件定義から設計、実装まで一貫して担当",
      "コードレビューとペアプログラミング",
      "技術的負債の削減とリファクタリング",
    ],
  },
  faq: [
    {
      q: "どのような技術スタックを推奨しますか？",
      a: "型安全性を重視し、保守性の高いコードベースを構築するため、TypeScriptと関数型プログラミングを推奨します。",
    },
    {
      q: "プロジェクトの相談はできますか？",
      a: "はい、お気軽にご連絡ください。SNSまたはメールでお問い合わせいただけます。",
    },
  ],
  cta: {
    primary: {
      label: "ブログを読む",
      href: "/blog",
    },
  },
} as const;
