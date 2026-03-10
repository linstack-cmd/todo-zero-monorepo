import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import jwt from "jsonwebtoken";

const app = new Hono();

const AUTH_SECRET = process.env.ZERO_AUTH_SECRET ?? "dev-secret-change-in-production";
const PORT = Number(process.env.PORT ?? 3001);

app.use("/*", cors());

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Simple auth endpoint - generates a JWT for Zero
// In production, replace with real auth (OAuth, etc.)
app.post("/api/auth/login", async (c) => {
  const body = await c.req.json<{ userId?: string; name?: string }>();
  const userId = body.userId ?? `user-${Date.now()}`;
  const name = body.name ?? "Anonymous";

  const token = jwt.sign(
    { sub: userId, name },
    AUTH_SECRET,
    { expiresIn: "24h" }
  );

  return c.json({ token, userId, name });
});

// Token refresh
app.post("/api/auth/refresh", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "No token" }, 401);
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), AUTH_SECRET) as {
      sub: string;
      name: string;
    };
    const token = jwt.sign(
      { sub: decoded.sub, name: decoded.name },
      AUTH_SECRET,
      { expiresIn: "24h" }
    );
    return c.json({ token });
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});

console.log(`🚀 Server running on http://localhost:${PORT}`);
serve({ fetch: app.fetch, port: PORT });
