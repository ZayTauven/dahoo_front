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
    // En développement l'API tourne sur localhost : Next 16 bloque les IP locales par défaut.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
