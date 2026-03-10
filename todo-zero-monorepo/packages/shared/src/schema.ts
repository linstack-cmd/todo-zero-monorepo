import {
  createSchema,
  table,
  string,
  boolean,
  number,
} from "@rocicorp/zero";

const todo = table("todo")
  .columns({
    id: string(),
    title: string(),
    completed: boolean(),
    sortOrder: number(),
    createdAt: number(),
  })
  .primaryKey("id");

export const schema = createSchema({
  tables: [todo],
  enableLegacyQueries: true,
  enableLegacyMutators: true,
});

export type Schema = typeof schema;
