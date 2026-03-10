import { useState } from "react";
import { useQuery, useZero } from "@rocicorp/zero/react";
import type { Schema, TodoFilter } from "@todo/shared";

const useZ = useZero<Schema>;

export function App() {
  const z = useZ();
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [newTitle, setNewTitle] = useState("");

  // Build query based on filter
  let query = z.query.todo.orderBy("sortOrder", "asc");
  if (filter === "active") {
    query = query.where("completed", false);
  } else if (filter === "completed") {
    query = query.where("completed", true);
  }

  const [todos] = useQuery(query);
  const [allTodos] = useQuery(z.query.todo);

  const activeCount = allTodos?.filter((t) => !t.completed).length ?? 0;
  const completedCount = allTodos?.filter((t) => t.completed).length ?? 0;

  const addTodo = () => {
    const title = newTitle.trim();
    if (!title) return;

    z.mutate.todo.insert({
      id: crypto.randomUUID(),
      title,
      completed: false,
      sortOrder: (allTodos?.length ?? 0) + 1,
      createdAt: Date.now(),
    });

    setNewTitle("");
  };

  const toggleTodo = (id: string, completed: boolean) => {
    z.mutate.todo.update({ id, completed: !completed });
  };

  const deleteTodo = (id: string) => {
    z.mutate.todo.delete({ id });
  };

  const clearCompleted = () => {
    const completed = allTodos?.filter((t) => t.completed) ?? [];
    for (const todo of completed) {
      z.mutate.todo.delete({ id: todo.id });
    }
  };

  return (
    <div className="flow-center" style={{ paddingBlock: "var(--flow-space-lg)" }}>
      <div className="flow-stack" data-space="lg">
        {/* Header */}
        <header className="app-header">
          <h1>✅ Todo Zero</h1>
          <p>
            <span className="sync-indicator">Synced with Zero</span>
          </p>
        </header>

        {/* Add todo */}
        <div className="flow-card">
          <div className="flow-stack" data-space="sm">
            <form
              className="todo-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                addTodo();
              }}
            >
              <input
                className="flow-input"
                type="text"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <button
                className="flow-btn"
                data-variant="primary"
                type="submit"
              >
                Add
              </button>
            </form>

            {/* Filters */}
            <div className="flow-row" data-justify="between">
              <div className="todo-filters">
                {(["all", "active", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    className="flow-badge"
                    data-active={filter === f ? "true" : undefined}
                    onClick={() => setFilter(f)}
                    style={{ cursor: "pointer", border: "none" }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <span className="todo-count">
                {activeCount} active · {completedCount} done
              </span>
            </div>
          </div>
        </div>

        {/* Todo list */}
        <div className="flow-card">
          <div className="flow-stack" data-space="sm">
            {!todos || todos.length === 0 ? (
              <p style={{ color: "var(--flow-text-muted)", textAlign: "center" }}>
                {filter === "all"
                  ? "No todos yet. Add one above!"
                  : `No ${filter} todos.`}
              </p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="todo-item"
                  data-completed={todo.completed ? "true" : undefined}
                >
                  <input
                    className="flow-checkbox"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                  />
                  <span className="todo-title">{todo.title}</span>
                  <button
                    className="flow-btn"
                    data-variant="ghost"
                    onClick={() => deleteTodo(todo.id)}
                    title="Delete"
                    style={{ fontSize: "var(--flow-text-sm)", padding: "0.25rem 0.5rem" }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        {completedCount > 0 && (
          <div style={{ textAlign: "center" }}>
            <button
              className="flow-btn"
              data-variant="danger"
              onClick={clearCompleted}
            >
              Clear completed ({completedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
