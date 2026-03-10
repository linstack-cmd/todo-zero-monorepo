import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema, type Schema } from "@todo/shared/schema";
import { App } from "./App";
import "./flow.css";

// Simple user ID - in production, use real auth
const userId = localStorage.getItem("todo-user-id") ?? `user-${crypto.randomUUID()}`;
localStorage.setItem("todo-user-id", userId);

const z = new Zero<Schema>({
  userID: userId,
  server: import.meta.env.VITE_PUBLIC_SERVER ?? "http://localhost:4848",
  schema,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ZeroProvider zero={z}>
      <App />
    </ZeroProvider>
  </StrictMode>
);
