import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  // Main app - VAA is the homepage
  index("routes/vaa/index.tsx"),
  route("questionnaire", "routes/vaa/questionnaire.tsx"),
  route("results", "routes/vaa/results.tsx"),
  route("compare", "routes/vaa/compare.tsx"),

  // Auth routes
  route("auth/login", "routes/auth/login.tsx"),
  route("auth/logout", "routes/auth/logout.tsx"),

  // API routes
  route("api/set-locale", "routes/api/set-locale.tsx"),
  route("api/vaa/calculate", "routes/api/vaa/calculate.tsx"),

  // Admin routes (for managing VAA content)
  ...prefix("admin", [
    layout("routes/admin/layout.tsx", [
      index("routes/admin/vaa/index.tsx"),
      route("statements", "routes/admin/vaa/statements/index.tsx"),
      route("statements/new", "routes/admin/vaa/statements/new.tsx"),
      route("statements/:id/edit", "routes/admin/vaa/statements/edit.tsx"),
      route("positions", "routes/admin/vaa/positions/index.tsx"),
      route("parties", "routes/admin/parties/index.tsx"),
      route("parties/new", "routes/admin/parties/new.tsx"),
      route("parties/:id/edit", "routes/admin/parties/edit.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
