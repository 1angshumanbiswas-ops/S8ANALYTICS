import type { MetadataRoute } from "next";

// Public marketplace pages (/, /courses, /courses/*, /instructors/*,
// /instructor/apply) are indexable. Everything behind sign-in - dashboards,
// the admin control tower, instructor studio, the learn player, auth pages
// and API routes - is disallowed: none of it is content Google should show
// searchers, and letting it crawl would just waste crawl budget.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/instructor/apply"],
      disallow: ["/admin", "/instructor/", "/dashboard", "/learn", "/api", "/sign-in", "/sign-up"],
    },
    sitemap: "https://learn.s8analytics.com/sitemap.xml",
  };
}
