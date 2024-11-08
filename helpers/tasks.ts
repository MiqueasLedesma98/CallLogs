import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {sendData} from '../api';

export const stopTask = () => {
  console.log('Tarea detenida');
  ReactNativeForegroundService.stopAll();
};

export const startTask = () => {
  ReactNativeForegroundService.start({
    id: 1244,
    title: 'Call Track',
    message: '...',
    icon: 'ic_launcher',
    buttonOnPress: 'cray',
    // @ts-ignore // Es un issue en la libreria
    setOnlyAlertOnce: true,
    color: '#000000',
  });
};

export function getCallLogs() {
  return async () => {
    try {
      await sendData();
    } catch (error) {
      console.error('Error al obtener el registro de llamadas:', error);
    }
  };
}
