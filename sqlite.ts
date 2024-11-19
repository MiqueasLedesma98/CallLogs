import SQLite, {
  ResultSet,
  SQLError,
  Transaction,
} from 'react-native-sqlite-storage';
import {DELAY, LIMIT} from './variables';
import {IConfig} from './interfaces/IConfig';

type QueryParams = (string | number)[];
interface Row {
  [key: string]: any;
}

class SQLITE {
  private static dbInstance: SQLite.SQLiteDatabase | null = null;
  private static dbName = 'CallLogApp.db';
  public config: IConfig | null;

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

    this.config = null;
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
    try {
      await Promise.all([
        this.executeQuery(`
          CREATE TABLE IF NOT EXISTS device (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone INTEGER
          );
        `),
        this.executeQuery(`
          CREATE TABLE IF NOT EXISTS config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            delay INTEGER,
            lim INTEGER
          );
        `),
      ]);

      // Insertar valores iniciales en 'config'
      const existingConfig = await this.executeQuery<IConfig>(
        'SELECT * FROM config WHERE id=1;',
      );
      if (existingConfig.length === 0) {
        await this.executeQuery(
          `INSERT INTO config (delay, lim) VALUES (?, ?);`,
          [DELAY, LIMIT],
        );
      }
    } catch (error) {
      console.error('Error al crear las tablas', error);
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
        delay INTEGER,
        lim INTEGER
      );
      INSERT INTO config (delay, lim) values (${DELAY}, ${LIMIT});
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
