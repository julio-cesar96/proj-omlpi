import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://observa.rnpi.org.br/sitemap.xml",
    host: "https://observa.rnpi.org.br",
  };
}
