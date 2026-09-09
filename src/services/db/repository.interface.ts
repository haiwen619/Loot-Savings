import type { SavingsJar, SavingsTransaction } from "../../types/savings";

export interface ISavingsRepository {
  /**
   * 初始化数据库（建表、索引与迁移）
   */
  init(): Promise<void>;

  /**
   * 当前是否运行在原生 SQLite 引擎上
   */
  isNative(): boolean;

  /**
   * 获取所有存钱罐列表
   */
  getJars(): Promise<SavingsJar[]>;

  /**
   * 保存或更新存钱罐
   */
  saveJar(jar: SavingsJar): Promise<void>;

  /**
   * 批量保存存钱罐
   */
  saveJars(jars: SavingsJar[]): Promise<void>;

  /**
   * 删除存钱罐（级联删除关联流水）
   */
  deleteJar(id: string): Promise<void>;

  /**
   * 获取流水记录（可指定存钱罐 ID，按时间倒序）
   */
  getTransactions(jarId?: string): Promise<SavingsTransaction[]>;

  /**
   * 新增一条流水记录
   */
  addTransaction(tx: SavingsTransaction): Promise<void>;

  /**
   * 批量保存流水记录
   */
  saveTransactions(txs: SavingsTransaction[]): Promise<void>;

  /**
   * 删除流水记录
   */
  deleteTransaction(id: string): Promise<void>;

  /**
   * 获取偏好设置
   */
  getSetting(key: string, defaultVal: string): Promise<string>;

  /**
   * 保存偏好设置
   */
  setSetting(key: string, val: string): Promise<void>;
}
