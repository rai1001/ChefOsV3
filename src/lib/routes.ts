export const PROTECTED_ROUTES = {
  DASHBOARD: "/dashboard",
  EVENTS: "/events",
  ORDERS: "/orders",
  INVENTORY: "/inventory",
  STAFF: "/staff",
  SETTINGS: "/settings"
} as const;

export const PROTECTED_PATHS = Object.values(PROTECTED_ROUTES);
