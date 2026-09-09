import { Capacitor } from "@capacitor/core";
import type { ISavingsRepository } from "./repository.interface";
import { SqliteStorageDriver } from "./sqlite-driver";
import { LocalStorageRepository } from "./localstorage-driver";
import { DEFAULT_JARS, DEFAULT_TRANSACTIONS } from "../storage";

class RepositoryManager implements ISavingsRepository {
  private driver: ISavingsRepository;
  private isNativeFlag: boolean;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.isNativeFlag = Capacitor.isNativePlatform();
    if (this.isNativeFlag) {
      this.driver = new SqliteStorageDriver();
    } else {
      this.driver = new LocalStorageRepository();
    }
  }

  isNative(): boolean {
    return this.isNativeFlag;
  }

  async init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          await this.driver.init();

          // 如果在原生 SQLite 环境且是新库（0 条数据），执行自动数据迁移/播种
          if (this.isNativeFlag) {
            const existingJars = await this.driver.getJars();
            if (existingJars.length === 0) {
              console.log("[DB] Native SQLite database is fresh, migrating initial seed data...");
              await this.driver.saveJars(DEFAULT_JARS);
              await this.driver.saveTransactions(DEFAULT_TRANSACTIONS);
            }
          }
        } catch (err) {
          console.warn("[DB] Native SQLite driver initialization failed, falling back to Web storage:", err);
          // 容错降级
          this.driver = new LocalStorageRepository();
          await this.driver.init();
        }
      })();
    }
    return this.initPromise;
  }

  async getJars() {
    await this.init();
    return this.driver.getJars();
  }

  async saveJar(jar: Parameters<ISavingsRepository["saveJar"]>[0]) {
    await this.init();
    return this.driver.saveJar(jar);
  }

  async saveJars(jars: Parameters<ISavingsRepository["saveJars"]>[0]) {
    await this.init();
    return this.driver.saveJars(jars);
  }

  async deleteJar(id: string) {
    await this.init();
    return this.driver.deleteJar(id);
  }

  async getTransactions(jarId?: string) {
    await this.init();
    return this.driver.getTransactions(jarId);
  }

  async addTransaction(tx: Parameters<ISavingsRepository["addTransaction"]>[0]) {
    await this.init();
    return this.driver.addTransaction(tx);
  }

  async saveTransactions(txs: Parameters<ISavingsRepository["saveTransactions"]>[0]) {
    await this.init();
    return this.driver.saveTransactions(txs);
  }

  async deleteTransaction(id: string) {
    await this.init();
    return this.driver.deleteTransaction(id);
  }

  async getSetting(key: string, defaultVal: string) {
    await this.init();
    return this.driver.getSetting(key, defaultVal);
  }

  async setSetting(key: string, val: string) {
    await this.init();
    return this.driver.setSetting(key, val);
  }
}

export const savingsRepo: ISavingsRepository = new RepositoryManager();
export * from "./repository.interface";
