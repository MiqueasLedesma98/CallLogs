import axios from 'axios';
import {LIMIT, URL_CONFIG, URL_FETCH} from './variables';
// @ts-ignore
import CallLogs from 'react-native-call-log'; // No tiene definición de tipos.
import DB from './sqlite';
import {stopTask} from './helpers/tasks';
import {IConfig} from './interfaces/IConfig';

export const sendData = async (bol = true) => {
  try {
    const config = await DB.executeQuery<IConfig>(
      'SELECT * FROM config LIMIT 1;',
    );
    const logs = await CallLogs.load(bol ? config[0].lim : -1);
    const data = await DB.executeQuery('SELECT * FROM config LIMIT 1;');

    if (!data[0] || !config[0]) return stopTask();

    if (URL_FETCH === '/') {
      console.log('');
      return;
    }

    const body: IJSON = {logs, phone: data[0].phone};

    await axios.post(URL_FETCH, body);
    console.log('callLogs enviados');
  } catch (error) {
    console.error(error);
  }
};

export const getConfig = async () => {
  try {
    const [response, config] = await Promise.all([
      URL_CONFIG !== '/' && axios.get<IConfig>(URL_CONFIG),
      DB.executeQuery('SELECT * FROM config WHERE id=1;'),
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

      const [insertedConfig] = await DB.executeQuery(
        'SELECT * FROM config WHERE id=1;',
      );

      return insertedConfig;
    }

    if (
      config[0] &&
      data &&
      (config[0].delay !== data.delay || config[0].limit !== data.lim)
    ) {
      await DB.executeQuery(
        'UPDATE config SET delay = ?, lim = ? WHERE id = 1;',
        [data.delay, data.lim, config[0].id],
      );

      const [updatedConfig] = await DB.executeQuery(
        'SELECT * FROM config WHERE id = 1;',
      );

      return updatedConfig;
    }

    return {lim: 50, delay: 1};
  } catch (error) {
    console.error('Error en getConfig:', error);
    return {delay: 1, lim: 50};
  }
};
