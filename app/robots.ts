import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/payment-success",
          "/admin/login",
        ],
      },
    ],
    sitemap: "https://www.omkkaar.com/sitemap.xml",
    host: "https://www.omkkaar.com",
  };
}
