/**
 * Failed-login throttling for POST /api/admin/login. A client (keyed by IP)
 * gets 5 failures per 15 minutes; past that it's refused until its oldest
 * failure leaves the window. A global backstop of 50 failures per 15 minutes
 * across all clients stops a brute force that rotates IPs — at the cost that,
 * while one is underway, the real admin is locked out too until it subsides.
 *
 * Counters live in memory, which suits a handful of admins. Each serverless
 * instance (and each restart) keeps its own, so on Vercel the limits apply
 * per warm instance. Swap the store for Postgres behind this same
 * consume/reset interface if that ever matters.
 */
export function createLoginLimiter({
  maxPerClient = 5,
  maxTotal = 50,
  windowMs = 15 * 60 * 1000,
  now = () => Date.now(),
} = {}) {
  // Failures inside the window, oldest first. Attempts past the backstop are
  // refused without being recorded, so this never grows beyond maxTotal.
  let failures = [];

  return {
    /**
     * Returns 0 and records the attempt as a failure up front, so parallel
     * guesses can't slip past the limit while the password check runs. When
     * the client (or everyone) is locked out, records nothing and returns the
     * ms until the lock lifts instead.
     */
    consume(client) {
      const time = now();
      failures = failures.filter((f) => f.at > time - windowMs);
      const mine = failures.filter((f) => f.client === client);

      // A lock lifts once enough of the failures behind it leave the window.
      const waits = [0];
      if (mine.length >= maxPerClient) {
        waits.push(mine[mine.length - maxPerClient].at + windowMs - time);
      }
      if (failures.length >= maxTotal) {
        waits.push(failures[failures.length - maxTotal].at + windowMs - time);
      }
      const wait = Math.max(...waits);
      if (wait === 0) failures.push({ client, at: time });
      return wait;
    },

    /** Forgets a client's failures after it signs in successfully. */
    reset(client) {
      failures = failures.filter((f) => f.client !== client);
    },
  };
}

export const loginLimiter = createLoginLimiter();
