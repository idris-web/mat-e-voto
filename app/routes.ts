import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  // VAA is the homepage
  index("routes/vaa/index.tsx"),
  route("questionnaire", "routes/vaa/questionnaire.tsx"),
  route("results", "routes/vaa/results.tsx"),
  route("compare", "routes/vaa/compare.tsx"),

  // API routes
  route("api/set-locale", "routes/api/set-locale.tsx"),
] satisfies RouteConfig;
