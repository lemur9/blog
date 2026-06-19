import { getAllPosts } from "./mdx";

export async function getTagCounts() {
  const posts = await getAllPosts();
  const tagCounts: Record<string, number> = {};
  posts.forEach((p) => {
    p.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  return tagCounts;
}

export async function getPostsByTag(tag: string) {
  const posts = await getAllPosts();
  return posts.filter((p) => p.tags.includes(tag));
}

export async function getAllTagNames(): Promise<string[]> {
  const posts = await getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export async function getAllTags(): Promise<string[]> {
  return getAllTagNames();
}
