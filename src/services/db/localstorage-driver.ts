import type { SavingsJar, SavingsTransaction } from "../../types/savings";
import type { ISavingsRepository } from "./repository.interface";
import { DEFAULT_JARS, DEFAULT_TRANSACTIONS } from "../storage";

const LOCAL_STORAGE_KEYS = {
  JARS: "loot_savings_jars_v2",
  TRANSACTIONS: "loot_savings_transactions_v2",
  SETTINGS_PREFIX: "loot_savings_setting_",
};

export class LocalStorageRepository implements ISavingsRepository {
  async init(): Promise<void> {
    // 首次若无数据，则预置初始数据
    const existingJars = localStorage.getItem(LOCAL_STORAGE_KEYS.JARS);
    if (!existingJars) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.JARS, JSON.stringify(DEFAULT_JARS));
    }
    const existingTx = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    if (!existingTx) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    }
  }

  isNative(): boolean {
    return false;
  }

  async getJars(): Promise<SavingsJar[]> {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.JARS);
      if (!raw) return DEFAULT_JARS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_JARS;
    } catch {
      return DEFAULT_JARS;
    }
  }

  async saveJar(jar: SavingsJar): Promise<void> {
    const jars = await this.getJars();
    const idx = jars.findIndex((j) => j.id === jar.id);
    let updated: SavingsJar[];
    if (idx >= 0) {
      updated = [...jars];
      updated[idx] = jar;
    } else {
      updated = [jar, ...jars];
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.JARS, JSON.stringify(updated));
  }

  async saveJars(jars: SavingsJar[]): Promise<void> {
    localStorage.setItem(LOCAL_STORAGE_KEYS.JARS, JSON.stringify(jars));
  }

  async deleteJar(id: string): Promise<void> {
    const jars = await this.getJars();
    const updated = jars.filter((j) => j.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.JARS, JSON.stringify(updated));

    // 级联删除关联的流水
    const txs = await this.getTransactions();
    const filteredTxs = txs.filter((t) => t.jarId !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTxs));
  }

  async getTransactions(jarId?: string): Promise<SavingsTransaction[]> {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
      if (!raw) return DEFAULT_TRANSACTIONS;
      const parsed = JSON.parse(raw);
      const allTxs: SavingsTransaction[] = Array.isArray(parsed) ? parsed : DEFAULT_TRANSACTIONS;
      if (jarId) {
        return allTxs.filter((t) => t.jarId === jarId);
      }
      return allTxs.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  }

  async addTransaction(tx: SavingsTransaction): Promise<void> {
    const txs = await this.getTransactions();
    const updated = [tx, ...txs];
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  }

  async saveTransactions(txs: SavingsTransaction[]): Promise<void> {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  }

  async deleteTransaction(id: string): Promise<void> {
    const txs = await this.getTransactions();
    const updated = txs.filter((t) => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  }

  async getSetting(key: string, defaultVal: string): Promise<string> {
    const val = localStorage.getItem(`${LOCAL_STORAGE_KEYS.SETTINGS_PREFIX}${key}`);
    return val !== null ? val : defaultVal;
  }

  async setSetting(key: string, val: string): Promise<void> {
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.SETTINGS_PREFIX}${key}`, val);
  }
}
