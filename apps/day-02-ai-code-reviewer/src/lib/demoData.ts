import { Summary } from "@/lib/types";

/** The language shown in the demo simulation. */
export const DEMO_LANGUAGE = "TypeScript";

/** The review focus shown in the demo simulation. */
export const DEMO_FOCUS = "Security";

/**
 * A realistic TypeScript function containing several intentional security
 * issues — SQL injection, sensitive data exposure, JWT without expiry, and
 * an unguarded environment variable — used as the demo code input.
 */
export const DEMO_CODE = `async function getUser(userId: string) {
  const query = \`SELECT * FROM users WHERE id = \${userId}\`;
  const rows = await db.query(query);

  if (!rows.length) return null;

  const user = rows[0];
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!
  );

  return { ...user, token };
}`;

/**
 * Mock plain-text review output that matches what the real model would produce
 * for DEMO_CODE with a Security focus. Streamed character-by-character in the
 * simulation to mimic actual LLM output.
 */
export const DEMO_REVIEW = `Security Review

1. SQL Injection — Critical

The query is constructed via string interpolation, making this function trivially exploitable. An attacker can pass a value like 1 OR 1=1 -- to dump the entire users table, or craft a UNION-based payload to read from other tables.

Fix: always use parameterised queries.

  const rows = await db.query(
    "SELECT * FROM users WHERE id = $1",
    [userId]
  );

2. Sensitive Data Exposure — High

The spread syntax copies every column from the database row into the return value — including password hashes, reset tokens, and any internal flags. The caller receives far more data than it should.

Fix: explicitly allowlist the fields you intend to return.

  return { id: user.id, email: user.email, token };

3. JWT Without Expiry — Medium

The token is signed with no expiresIn claim, so it is valid indefinitely. If a token is stolen or leaked there is no time-based limit to the exposure window.

Fix: set a short expiry and pair it with a refresh-token flow.

  jwt.sign(payload, secret, { expiresIn: "15m" });

4. Unguarded Environment Variable — Low

The non-null assertion on process.env.JWT_SECRET! suppresses the TypeScript error but provides no runtime protection. If the variable is absent the function silently produces tokens signed with undefined.

Fix: validate secrets at startup and throw early with a descriptive error if any are missing.`;

/**
 * Mock summary returned by the stats endpoint for the demo review.
 * Matches the severity and content of DEMO_REVIEW.
 */
export const DEMO_SUMMARY: Summary = {
  severity: "red",
  headline:
    "Critical SQL injection and data exposure vulnerabilities must be fixed before this is deployed.",
  points: [
    "SQL injection via string interpolation — trivially exploitable",
    "Entire database row returned, including password hash and sensitive fields",
    "JWT tokens have no expiry — stolen tokens are valid indefinitely",
  ],
};
