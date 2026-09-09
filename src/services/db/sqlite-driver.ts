import { CapacitorSQLite } from "@capacitor-community/sqlite";
import type { SavingsJar, SavingsTransaction, JarThemeColor } from "../../types/savings";
import type { ISavingsRepository } from "./repository.interface";
import { DB_NAME, DB_SCHEMA_DDL, DB_VERSION } from "./schema";

interface SqliteJarRow {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  deadline: string | null;
  theme_color: string;
  emoji: string;
  created_at: string;
}

interface SqliteTxRow {
  id: string;
  jar_id: string;
  type: "deposit" | "withdraw";
  amount: number;
  note: string | null;
  timestamp: number;
}

export class SqliteStorageDriver implements ISavingsRepository {
  private initialized = false;

  isNative(): boolean {
    return true;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // 检查数据库是否已打开
      const checkOpen = await CapacitorSQLite.isDBOpen({ database: DB_NAME });
      if (!checkOpen.result) {
        try {
          await CapacitorSQLite.createConnection({
            database: DB_NAME,
            version: DB_VERSION,
            encrypted: false,
            mode: "no-encryption",
          });
        } catch {
          // 连接可能已在底层存在，忽略报错继续打开
        }

        // 打开数据库
        await CapacitorSQLite.open({ database: DB_NAME });
      }

      // 开启外键约束并建表
      await CapacitorSQLite.execute({
        database: DB_NAME,
        statements: "PRAGMA foreign_keys = ON;\n" + DB_SCHEMA_DDL,
      });

      this.initialized = true;
    } catch (err) {
      console.error("[SQLite Driver] Initialization failed:", err);
      throw err;
    }
  }

  async getJars(): Promise<SavingsJar[]> {
    await this.init();
    const res = await CapacitorSQLite.query({
      database: DB_NAME,
      statement: "SELECT * FROM jars ORDER BY created_at DESC;",
      values: [],
    });

    const rows = (res.values as SqliteJarRow[]) || [];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      targetAmount: Number(r.target_amount),
      currentAmount: Number(r.current_amount),
      currency: r.currency || "¥",
      deadline: r.deadline || undefined,
      themeColor: (r.theme_color || "emerald") as JarThemeColor,
      emoji: r.emoji || "🍯",
      createdAt: r.created_at,
    }));
  }

  async saveJar(jar: SavingsJar): Promise<void> {
    await this.init();
    const sql = `
      INSERT OR REPLACE INTO jars 
      (id, name, target_amount, current_amount, currency, deadline, theme_color, emoji, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    await CapacitorSQLite.run({
      database: DB_NAME,
      statement: sql,
      values: [
        jar.id,
        jar.name,
        jar.targetAmount,
        jar.currentAmount,
        jar.currency,
        jar.deadline || null,
        jar.themeColor,
        jar.emoji,
        jar.createdAt,
      ],
    });
  }

  async saveJars(jars: SavingsJar[]): Promise<void> {
    for (const jar of jars) {
      await this.saveJar(jar);
    }
  }

  async deleteJar(id: string): Promise<void> {
    await this.init();
    await CapacitorSQLite.run({
      database: DB_NAME,
      statement: "DELETE FROM jars WHERE id = ?;",
      values: [id],
    });
  }

  async getTransactions(jarId?: string): Promise<SavingsTransaction[]> {
    await this.init();
    const sql = jarId
      ? "SELECT * FROM transactions WHERE jar_id = ? ORDER BY timestamp DESC;"
      : "SELECT * FROM transactions ORDER BY timestamp DESC;";
    const values = jarId ? [jarId] : [];

    const res = await CapacitorSQLite.query({
      database: DB_NAME,
      statement: sql,
      values,
    });

    const rows = (res.values as SqliteTxRow[]) || [];
    return rows.map((r) => ({
      id: r.id,
      jarId: r.jar_id,
      type: r.type,
      amount: Number(r.amount),
      note: r.note || undefined,
      timestamp: Number(r.timestamp),
    }));
  }

  async addTransaction(tx: SavingsTransaction): Promise<void> {
    await this.init();
    const sql = `
      INSERT OR REPLACE INTO transactions 
      (id, jar_id, type, amount, note, timestamp)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    await CapacitorSQLite.run({
      database: DB_NAME,
      statement: sql,
      values: [tx.id, tx.jarId, tx.type, tx.amount, tx.note || null, tx.timestamp],
    });
  }

  async saveTransactions(txs: SavingsTransaction[]): Promise<void> {
    for (const tx of txs) {
      await this.addTransaction(tx);
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.init();
    await CapacitorSQLite.run({
      database: DB_NAME,
      statement: "DELETE FROM transactions WHERE id = ?;",
      values: [id],
    });
  }

  async getSetting(key: string, defaultVal: string): Promise<string> {
    await this.init();
    const res = await CapacitorSQLite.query({
      database: DB_NAME,
      statement: "SELECT value FROM app_settings WHERE key = ?;",
      values: [key],
    });
    if (res.values && res.values.length > 0) {
      return String(res.values[0].value);
    }
    return defaultVal;
  }

  async setSetting(key: string, val: string): Promise<void> {
    await this.init();
    await CapacitorSQLite.run({
      database: DB_NAME,
      statement: "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);",
      values: [key, val],
    });
  }
}
