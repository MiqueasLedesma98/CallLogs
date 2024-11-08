import axios from 'axios';
import {LIMIT, URL_FETCH} from './variables';
// @ts-ignore
import CallLogs from 'react-native-call-log'; // No tiene definición de tipos.
import DB from './sqlite';
import {stopTask} from './helpers/tasks';

export const sendData = async (bol = true) => {
  try {
    const [logs, data] = await Promise.all([
      CallLogs.load(bol ? LIMIT : -1),
      DB.executeQuery('SELECT * FROM device LIMIT 1;'),
    ]);

    if (!data[0]) return stopTask();

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
