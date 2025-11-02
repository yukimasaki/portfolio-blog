import type { Tag } from "@/domain/tags/entities";
import { TagBadge } from "@/presentation/components/common/tag-badge";

interface TagListProps {
  readonly tags: Tag[];
  readonly title?: string;
  readonly className?: string;
  readonly showCount?: boolean;
  readonly link?: boolean;
}

export const TagList = ({
  tags,
  title,
  className,
  showCount = true,
  link = true,
}: TagListProps) => {
  // 投稿数が0のタグを除外
  const tagsWithPosts = tags.filter(tag => tag.count.value > 0);

  if (tagsWithPosts.length === 0) {
    return (
      <div className={className}>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <p className="text-sm text-muted-foreground">タグがありません</p>
      </div>
    );
  }

  const sorted = [...tagsWithPosts].sort((a, b) => b.count.value - a.count.value);

  return (
    <div className={className}>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <ul className="flex flex-wrap gap-2">
        {sorted.map(tag => (
          <li key={tag.id.value}>
            <TagBadge tag={tag} showCount={showCount} link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
};
