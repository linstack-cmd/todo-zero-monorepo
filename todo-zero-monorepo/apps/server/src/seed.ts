import pg from "pg";

const DATABASE_URL =
  process.env.ZERO_UPSTREAM_DB ??
  "postgresql://postgres:password@localhost:5432/todo_zero";

async function seed() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  // Create table
  await client.query(`
    CREATE TABLE IF NOT EXISTS todo (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    );
  `);

  // Seed data
  const todos = [
    { id: "todo-1", title: "Learn Zero sync", completed: false, sortOrder: 0 },
    { id: "todo-2", title: "Build a todo app", completed: true, sortOrder: 1 },
    { id: "todo-3", title: "Deploy to Dokploy", completed: false, sortOrder: 2 },
    { id: "todo-4", title: "Add Flow CSS styling", completed: false, sortOrder: 3 },
    { id: "todo-5", title: "Set up Electron desktop app", completed: false, sortOrder: 4 },
  ];

  for (const todo of todos) {
    await client.query(
      `INSERT INTO todo (id, title, completed, "sortOrder", "createdAt")
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [todo.id, todo.title, todo.completed, todo.sortOrder, Date.now()]
    );
  }

  console.log("✅ Seeded", todos.length, "todos");
  await client.end();
}

seed().catch(console.error);
