import type { NextConfig } from "next";

const apiUrl = new URL(process.env.DAHOO_API_URL ?? "http://localhost:8000");

const nextConfig: NextConfig = {
  // Le relais /api/backend doit transmettre les URL avec leur barre finale (Django REST Framework) :
  // la normalisation des pages est faite dans src/proxy.ts.
  skipTrailingSlashRedirect: true,
  transpilePackages: ["apexcharts"],
  images: {
    // Photos des annonces servies par l'API Django : seul ce chemin de cet hôte est autorisé.
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/media/**",
      },
    ],
    // Next 16 bloque les images venant d'IP privées (protection SSRF). On ne l'autorise que si l'API
    // elle-même est locale (poste de développement, démo) : les motifs ci-dessus limitent déjà les
    // images à /media/** sur l'hôte de l'API. Avec une API sur un vrai domaine, la protection reste active.
    dangerouslyAllowLocalIP: ["localhost", "127.0.0.1", "[::1]"].includes(apiUrl.hostname),
  },
};

export default nextConfig;
