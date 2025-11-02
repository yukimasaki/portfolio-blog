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
 * 本プロジェクトの概要と技術スタックを反映
 */
export const PROFILE: Profile = {
  name: "Yuki Masaki",
  title: "Webアプリケーションエンジニア",
  tagline: "関数型プログラミングとクリーンアーキテクチャで価値を創造する",
  avatarUrl: undefined,
  socials: [
    { label: "GitHub", url: "https://github.com/ftsmasaki", icon: "github" },
  ],
  summary: [
    "WordPress REST APIをCMSとして活用したポートフォリオブログサイトの構築",
    "関数型ドメインモデリングとクリーンアーキテクチャによる保守性の高いコードベース",
    "bulletproof-react準拠の機能別ディレクトリ構造",
    "グラスモーフィズムとTailwind CSS 4によるモダンなUI/UXの実現",
  ],
  principles: [
    "関数型ドメインモデリングによる純粋関数の活用",
    "クリーンアーキテクチャによるレイヤー分離（domain, application, infrastructure, presentation, shared）",
    "bulletproof-react準拠の機能別ディレクトリ構造",
    "型安全性を重視したTypeScript開発（any型禁止、厳格な型チェック）",
    "段階的実装とユーザー確認による品質保証",
    "テスト可能な設計の徹底（Vitest + Testing Library）",
  ],
  stacks: {
    languages: ["TypeScript", "JavaScript"],
    frontend: [
      "Next.js 16",
      "React 19",
      "Tailwind CSS 4",
      "shadcn/ui",
      "Radix UI",
      "framer-motion",
      "TanStack Query",
      "Zustand",
      "fp-ts",
      "lucide-react",
    ],
    backend: ["Next.js API Routes", "Hono", "Node.js"],
    infra: ["Vercel", "GitHub Actions"],
    test: ["Vitest 4", "Vite 6", "Testing Library"],
    tools: [
      "ESLint 9",
      "eslint-config-next",
      "Prettier",
      "tsyringe",
      "zod",
      "flexsearch",
      "date-fns",
      "rehype ecosystem",
      "shiki",
      "next-themes",
      "@next/third-parties (GA4)",
    ],
  },
  interests: {
    now: [
      "関数型ドメインモデリングの実践",
      "クリーンアーキテクチャによるレイヤー分離",
      "Next.js 16とReact 19の新機能活用",
      "Tailwind CSS 4によるデザインシステム構築",
    ],
    next: [
      "WordPress REST APIとの統合最適化",
      "パフォーマンス最適化（Core Web Vitals）",
      "アクセシビリティの向上",
    ],
    later: [
      "On-Demand ISRによるレンダリング速度の向上",
      "SSGOIによるアニメーションの実装",
    ],
  },
  highlights: [
    {
      title: "ポートフォリオブログサイト",
      description:
        "WordPress REST APIをCMSとして活用し、関数型ドメインモデリングとクリーンアーキテクチャを採用したNext.js 16 + React 19ベースのポートフォリオブログサイト。グラスモーフィズムデザインとTailwind CSS 4によるモダンなUI/UXを実現。",
      tags: [
        "Next.js 16",
        "React 19",
        "TypeScript",
        "Tailwind CSS 4",
        "WordPress REST API",
        "クリーンアーキテクチャ",
        "関数型プログラミング",
      ],
      link: {
        href: "/blog",
        label: "ブログを見る",
      },
    },
  ],
  workStyle: {
    can: [
      "Webアプリケーション開発（フロントエンド・バックエンド）",
      "関数型プログラミングとクリーンアーキテクチャによる設計",
      "型安全なコードベースの構築（TypeScript厳格モード）",
      "WordPress REST APIとの統合",
      "モダンなUI/UX実装（グラスモーフィズム、レスポンシブデザイン）",
    ],
    preferred: [
      "要件定義から設計、実装まで一貫して担当",
      "段階的実装とユーザー確認による品質保証",
      "コードレビューとペアプログラミング",
      "技術的負債の削減とリファクタリング",
      "テスト駆動開発（TDD）の実践",
    ],
  },
  faq: [
    {
      q: "どのようなアーキテクチャを採用していますか？",
      a: "関数型ドメインモデリングとクリーンアーキテクチャを採用し、レイヤー分離（domain, application, infrastructure, presentation, shared）を徹底しています。これにより保守性とテスタビリティの高いコードベースを実現しています。",
    },
    {
      q: "CMSとしてWordPressを選んだ理由は？",
      a: "WordPress REST APIをCMSとして活用することで、コンテンツ管理の柔軟性を確保しながら、Next.jsによる高速なSSR/SSGの恩恵を受けられるためです。",
    },
    {
      q: "プロジェクトの相談はできますか？",
      a: "はい、お気軽にご連絡ください。GitHubまたはSNSでお問い合わせいただけます。",
    },
  ],
  cta: {
    primary: {
      label: "ブログを読む",
      href: "/blog",
    },
    secondary: {
      label: "Aboutを見る",
      href: "/about",
    },
  },
} as const;
