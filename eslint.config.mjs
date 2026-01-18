import nextConfig from "eslint-config-next";

export default [
  {
    ignores: [
      ".next/*",
      "node_modules/*",
      "supabase/.temp/*",
      "supabase/.branches/*",
      "supabase/.env*"
    ]
  },
  ...nextConfig()
];
