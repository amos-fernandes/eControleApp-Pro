// databases/database.ts (adaptado para exportar getRealm)
import { openDatabaseSync } from 'expo-sqlite';

let _db: any = null;

export const getRealm = async () => {
  if (!_db) {
    _db = openDatabaseSync('econtrole.db');
    // Inicializar o esquema de tabelas do banco de dados SQLite
    _db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS credentials (
      _id TEXT PRIMARY KEY NOT NULL,
      accessToken TEXT,
      uid TEXT,
      client TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      name TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS service_orders (
      id INTEGER PRIMARY KEY NOT NULL,
      identifier TEXT,
      status TEXT,
      service_date TEXT,
      customer_id INTEGER,
      customer_name TEXT,
      address_text TEXT,
      observations TEXT,
      driver_observations TEXT,
      created_at TEXT,
      vehicle_info TEXT,
      voyage_info TEXT
    );

    CREATE TABLE IF NOT EXISTS service_executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_order_id INTEGER,
      service_name TEXT,
      amount INTEGER,
      unit_name TEXT,
      item_weights TEXT,
      FOREIGN KEY(service_order_id) REFERENCES service_orders(id)
    );

    CREATE TABLE IF NOT EXISTS service_order_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_order_id INTEGER,
      image_url TEXT,
      image_path TEXT,
      created_at TEXT,
      FOREIGN KEY(service_order_id) REFERENCES service_orders(id)
    );

    CREATE TABLE IF NOT EXISTS mtrs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_order_id INTEGER,
      mtr_id TEXT UNIQUE,
      status TEXT,
      emission_date TEXT,
      download_path TEXT,
      created_at TEXT,
      FOREIGN KEY(service_order_id) REFERENCES service_orders(id)
    );
  `);
  }
  return _db;
};
