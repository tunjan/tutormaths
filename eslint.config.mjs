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
  {
    // The React Compiler-era hook rules that eslint-config-next 16 newly turns
    // on flag several pre-existing, idiomatic patterns (the next-themes mount
    // guard, ref-sync during render, Date.now() inside filters/useMemo).
    // Demote them to warnings so they stay visible without blocking CI; revisit
    // when adopting the React Compiler in earnest.
    rules: {
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
