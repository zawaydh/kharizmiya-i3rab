import type { MetadataRoute } from "next";
import { TOPIC_CATALOG } from "../lib/topicCatalog";

const SITE_URL = "https://i3rabuk.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/about",
    "/guide",
    "/topics",
    "/i3rab-keys",
    "/i3rab-in-our-speech",
    "/paths",
    "/games",
    "/games/markati",
    "/games/where-is-my-place",
    "/games/which-object",
    "/games/who-is-with-me",
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const topicPages: MetadataRoute.Sitemap = TOPIC_CATALOG
    .filter((topic) => topic.isReady)
    .flatMap((topic) => [
      {
        url: `${SITE_URL}/guide/${topic.code}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/learn/${topic.code}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
    ]);

  return [...staticPages, ...topicPages];
}
