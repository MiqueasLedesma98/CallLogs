import SQLite, {
  ResultSet,
  SQLError,
  Transaction,
} from 'react-native-sqlite-storage';
import {DELAY} from './variables';

type QueryParams = (string | number)[];
interface Row {
  [key: string]: any;
}

class SQLITE {
  private static dbInstance: SQLite.SQLiteDatabase | null = null;
  private static dbName = 'CallLogApp.db';

  constructor() {
    if (!SQLITE.dbInstance) {
      SQLITE.dbInstance = SQLite.openDatabase(
        {
          name: SQLITE.dbName,
          location: 'default',
        },
        this.openSuccess,
        this.openError,
      );
    }
  }

  private openSuccess = () => {
    console.log('Base de datos abierta exitosamente');
  };

  private openError = (error: SQLError) => {
    console.error('Error al abrir la base de datos', error);
  };

  public executeQuery = <T = Row>(
    query: string,
    params: QueryParams = [],
  ): Promise<T[]> =>
    new Promise((resolve, reject) => {
      if (!SQLITE.dbInstance) {
        reject('No se pudo abrir la base de datos');
        return;
      }

      SQLITE.dbInstance.transaction((tx: Transaction) => {
        tx.executeSql(
          query,
          params,
          (_, resultSet: ResultSet) => {
            const rows: T[] = [];
            for (let row = 0; row < resultSet.rows.length; row++) {
              rows.push(resultSet.rows.item(row));
            }
            resolve(rows);
          },
          (_, error): boolean => {
            reject(error);
            return false;
          },
        );
      });
    });

  public closeDatabase = (): void => {
    if (SQLITE.dbInstance) {
      SQLITE.dbInstance
        .close()
        .then(() => {
          SQLITE.dbInstance = null;
        })
        .catch((error: any) => {
          console.error('Error al cerrar la base de datos', error);
        });
    }
  };

  public createTable = async (): Promise<void> => {
    const query = `
      CREATE TABLE IF NOT EXISTS device (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone INTEGER
      );
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time NUMBER
      );
      INSERT INTO config (time) values (${DELAY});
    `;

    try {
      await this.executeQuery(query);
    } catch (error) {
      console.error('Error al crear la tabla', error);
    }
  };

  public resetDatabase = async (): Promise<void> => {
    const dropTablesQuery = `
      DROP TABLE IF EXISTS device;
      DROP TABLE IF EXISTS config;
    `;
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS device (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone INTEGER
      );
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time NUMBER
      );
      INSERT INTO config (time) VALUES (${DELAY});
    `;

    try {
      await this.executeQuery(dropTablesQuery);
      console.log('Tablas eliminadas correctamente');

      await this.executeQuery(createTablesQuery);
      console.log('Tablas creadas correctamente');
    } catch (error) {
      console.error('Error al reiniciar la base de datos', error);
    }
  };
}

const DB = new SQLITE();

export default DB;
