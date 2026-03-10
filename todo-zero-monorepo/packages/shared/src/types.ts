export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  sortOrder: number;
  createdAt: number;
}

export type TodoFilter = "all" | "active" | "completed";
