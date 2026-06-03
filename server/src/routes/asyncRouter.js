import { Router } from "express";

/**
 * Express 4 doesn't forward rejected promises from async route handlers to the
 * error middleware — an unhandled rejection would crash the process. This
 * returns a Router whose verb methods auto-wrap every handler so any thrown or
 * rejected error is routed to next(err) (and our JSON error handler) instead.
 */
export function asyncRouter() {
  const router = Router();
  const wrap = (h) =>
    typeof h === "function"
      ? (req, res, next) => Promise.resolve(h(req, res, next)).catch(next)
      : h;
  for (const method of ["get", "post", "put", "delete", "patch"]) {
    const original = router[method].bind(router);
    router[method] = (path, ...handlers) => original(path, ...handlers.map(wrap));
  }
  return router;
}
