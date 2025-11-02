import type { Tag } from "@/domain/tags/entities";
import { TagList } from "@/presentation/components/common/tag-list";

interface PopularTagsProps {
  readonly tags: readonly Tag[];
}

/**
 * トップページの人気タグセクションコンポーネント
 */
export function PopularTags({ tags }: PopularTagsProps) {
  // 投稿数が0のタグを除外してから、人気タグを取得（使用回数でソート、上位10件）
  const popularTags = [...tags]
    .filter(tag => tag.count.value > 0)
    .sort((a, b) => b.count.value - a.count.value)
    .slice(0, 10);

  if (popularTags.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <TagList
        tags={popularTags}
        title="人気タグ"
        showCount={false}
        link={true}
      />
    </section>
  );
}

