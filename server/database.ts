import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Somente armazenamento local. Não aceita URL, credencial ou vínculo de produção.
const directory = resolve('.data');
mkdirSync(directory, { recursive: true });
export const sqlite = new DatabaseSync(resolve(directory, 'demo.sqlite'));
sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');

export const localDatabase: D1Database = {
  prepare(sql: string): D1PreparedStatement {
    const create = (values: unknown[]): D1PreparedStatement => ({
      bind: (...next: unknown[]) => create(next),
      async first<T>() { return (sqlite.prepare(sql).get(...values as never[]) ?? null) as T | null; },
      async all<T>() { return { results: sqlite.prepare(sql).all(...values as never[]) as T[] }; },
      async run() { const result = sqlite.prepare(sql).run(...values as never[]); return { success: true, meta: { changes: Number(result.changes) } }; },
      _execute() { return { results: sqlite.prepare(sql).all(...values as never[]) }; },
    });
    return create([]);
  },
  async batch<T>(operations: D1PreparedStatement[]) {
    // As operações SQLite são síncronas; o lote fica isolado até terminar.
    sqlite.exec('BEGIN');
    try {
      const results = [];
      for (const operation of operations) results.push(operation._execute());
      sqlite.exec('COMMIT');
      return results as { results: T[] }[];
    } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  },
};
