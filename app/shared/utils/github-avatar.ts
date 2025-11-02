import { PROFILE } from "@/shared/constants/profile";

/**
 * GitHub URLからユーザー名を抽出する関数
 * @param githubUrl - GitHub URL (例: "https://github.com/username")
 * @returns ユーザー名、またはnull
 */
function extractGitHubUsername(githubUrl: string): string | null {
  const match = githubUrl.match(/github\.com\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * GitHubアバター画像URLを取得する関数
 * @returns GitHubアバター画像URL、またはnull
 */
export function getGitHubAvatarUrl(): string | null {
  const githubSocial = PROFILE.socials.find(social => social.icon === "github");

  if (!githubSocial) {
    return null;
  }

  const username = extractGitHubUsername(githubSocial.url);
  if (!username) {
    return null;
  }

  // GitHubのアバター画像URLを生成
  // サイズパラメータを指定可能（デフォルトは40x40、サイズ指定可）
  return `https://github.com/${username}.png?size=256`;
}
