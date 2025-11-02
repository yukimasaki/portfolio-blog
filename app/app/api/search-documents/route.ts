import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env";
import type { SearchableDocument } from "@/infrastructure/search/search-index";

export const runtime = "nodejs";

interface WpRenderedField {
  rendered?: string;
}

interface WpPostMinimal {
  id: number | string;
  title?: WpRenderedField | null;
  excerpt?: WpRenderedField | null;
  content?: WpRenderedField | null;
  slug?: string | null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  const baseUrl = serverEnv.WORDPRESS_URL;

  try {
    const perPage = 100; // 調整可能。必要に応じてページネーション対応
    const url = `${baseUrl}/wp-json/wp/v2/posts?per_page=${perPage}&_embed=true`;

    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch posts: ${res.status}` },
        { status: 503 }
      );
    }

    const wpPosts = (await res.json()) as WpPostMinimal[];

    const documents: SearchableDocument[] = wpPosts.map((p: WpPostMinimal) => {
      const id = typeof p.id === "number" ? p.id : Number(p.id);
      const title =
        typeof p.title?.rendered === "string"
          ? stripHtml(p.title.rendered)
          : String(p.title ?? "");
      const excerpt =
        typeof p.excerpt?.rendered === "string"
          ? stripHtml(p.excerpt.rendered)
          : String(p.excerpt ?? "");
      const content =
        typeof p.content?.rendered === "string"
          ? stripHtml(p.content.rendered)
          : String(p.content ?? "");
      const slug = String(p.slug ?? "");
      return { id: Number.isNaN(id) ? 0 : id, title, excerpt, content, slug };
    });

    return NextResponse.json(documents, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
