import axios from 'axios';
import {URL_CONFIG, URL_FETCH} from './variables';
// @ts-ignore
import CallLogs from 'react-native-call-log'; // No tiene definición de tipos.
import DB from './sqlite';
import {stopTask} from './helpers/tasks';
import {IConfig, IUser} from './interfaces/IConfig';
import {IJSON} from './interfaces/IJson';

export const sendData = async (bol = false) => {
  try {
    const config = await DB.executeQuery<IConfig>(
      'SELECT * FROM config LIMIT 1;',
    );
    const logs = await CallLogs.load(!bol ? config[0].lim : 300); // Aquí 300 es la cantidad de registros que enviara historico
    const data = await DB.executeQuery<IUser>('SELECT * FROM device LIMIT 1;');

    if (!data[0]?.phone || !config[0]) {
      console.log('No hay datos para enviar');
      return stopTask();
    }

    if (!data[0]?.phone) throw new Error('No esta el telefono la ptm');

    const body: IJSON = {anexo: logs, destino: data[0].phone};

    const fetchConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: URL_FETCH,
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(body),
    };

    await axios.request(fetchConfig);

    console.log('callLogs enviados');
  } catch (error) {
    console.log(error);
  }
};

export const getConfig = async () => {
  try {
    const [response, config] = await Promise.all([
      URL_CONFIG && axios.get<IConfig>(URL_CONFIG),
      DB.executeQuery<IConfig>('SELECT * FROM config WHERE id=1;'),
    ]);

    const {data} = response || {};

    if ((!data && config[0]) || !data?.delay || !data?.lim || !config[0]) {
      await DB.executeQuery(
        'UPDATE config SET delay = ?, lim = ? WHERE id = 1;',
        [1, 50],
      );

      return {lim: 50, delay: 1};
    }

    if (!config[0] && data) {
      await DB.executeQuery(
        'UPDATE config SET delay = ?, lim = ? WHERE id = 1;',
        [data.delay, data.lim],
      );

      const [insertedConfig] = await DB.executeQuery<IConfig>(
        'SELECT * FROM config WHERE id=1;',
      );

      return insertedConfig;
    }

    if (
      config[0] &&
      data &&
      (config[0].delay !== data.delay || config[0].lim !== data.lim)
    ) {
      await DB.executeQuery(
        'UPDATE config SET delay = ?, lim = ? WHERE id = 1;',
        [data.delay, data.lim],
      );

      const [updatedConfig] = await DB.executeQuery<IConfig>(
        'SELECT * FROM config WHERE id = 1;',
      );

      return updatedConfig;
    }

    return {lim: 50, delay: 1};
  } catch (error) {
    console.log('Error en getConfig:', error);
    return {delay: 1, lim: 50};
  }
};
