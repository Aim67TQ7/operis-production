import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Fill %VITE_*% placeholders in index.html, falling back to sensible defaults
 * so the app still builds before anyone has written a .env.
 */
function htmlEnv(values: Record<string, string>): Plugin {
  return {
    name: "html-env-defaults",
    transformIndexHtml(html) {
      return html.replace(/%(\w+)%/g, (match, key: string) => values[key] ?? match);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const appName = env.VITE_APP_NAME || "Ops Daily";
  const appDescription = env.VITE_APP_DESCRIPTION || "Operations tracking dashboard";
  const themeColor = env.VITE_THEME_COLOR || "#1a1a2e";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
    },
    plugins: [
      react(),
      htmlEnv({
        VITE_APP_NAME: appName,
        VITE_APP_DESCRIPTION: appDescription,
        VITE_THEME_COLOR: themeColor,
      }),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "logo.svg"],
        manifest: {
          name: appName,
          short_name: appName,
          description: appDescription,
          theme_color: themeColor,
          background_color: themeColor,
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            { src: "logo.svg", sizes: "any", type: "image/svg+xml" },
            {
              src: "logo.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*supabase.*$/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-cache",
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  };
});
