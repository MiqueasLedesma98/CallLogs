import {PermissionsAndroid} from 'react-native';
import DB from '../sqlite';

export async function requestCallLogPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      {
        title: 'Permiso para acceder al registro de llamadas',
        message: 'La app necesita acceder a tu registro de llamadas',
        buttonNeutral: 'Preguntar después',
        buttonNegative: 'Cancelar',
        buttonPositive: 'Aceptar',
      },
    );

    const granted2 = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      {
        title: 'Permiso para leer el estado del teléfono',
        message: 'La app necesita leer el estado del teléfono',
        buttonNeutral: 'Preguntar después',
        buttonNegative: 'Cancelar',
        buttonPositive: 'Aceptar',
      },
    );

    const granted3 = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Permiso para enviar notificaciones',
        message: 'La app necesita enviar notificaciones',
        buttonNeutral: 'Preguntar después',
        buttonNegative: 'Cancelar',
        buttonPositive: 'Aceptar',
      },
    );

    const [phoneData] = await DB.executeQuery(
      'SELECT * FROM device LIMIT 1;',
    );

    return (
      granted === PermissionsAndroid.RESULTS.GRANTED &&
      granted2 === PermissionsAndroid.RESULTS.GRANTED &&
      granted3 === PermissionsAndroid.RESULTS.GRANTED &&
      !!phoneData
    );
  } catch (err) {
    console.warn(err);
    return false;
  }
}
