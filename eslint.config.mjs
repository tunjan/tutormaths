import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// `next lint` was removed in Next.js 16. eslint-config-next v16 ships native
// flat-config arrays, so we spread them directly into the flat config.
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "supabase/functions/**",
      "lib/database.types.ts",
      "next-env.d.ts",
    ],
  },
  ...next,
  ...nextTs,
];

export default eslintConfig;
