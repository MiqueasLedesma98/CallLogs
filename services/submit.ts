import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {requestCallLogPermission} from '../helpers/permissions';
import DB from '../sqlite';
import {getCallLogs, startTask} from '../helpers/tasks';
import {getConfig} from '../api';

interface IProps {
  phoneNumber: string;
  setCurrentPhone: React.Dispatch<React.SetStateAction<string>>;
  setPermission: React.Dispatch<React.SetStateAction<boolean>>;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
}

export const handleSubmit =
  ({phoneNumber, setCurrentPhone, setPermission, setPhoneNumber}: IProps) =>
  () => {
    if (phoneNumber.length > 5)
      DB.executeQuery('INSERT INTO device (phone) VALUES (?);', [phoneNumber])
        .then(() =>
          requestCallLogPermission()
            .then(value => {
              if (value) {
                setPermission(value);
                getConfig().then(config => {
                  if (!config)
                    throw new Error('Falla al configurar el servicio');

                  ReactNativeForegroundService.add_task(getCallLogs(), {
                    delay: config.delay * 1000 * 60,
                    onLoop: true,
                    taskId: 'taskid',
                    onSuccess: () => console.log('Tarea ejecutada'),
                    // @ts-ignore
                    onError: e => console.log('Error logging:', e),
                  });
                  startTask();
                });
              }
            })
            .catch(console.error),
        )
        .catch(console.error);
    setCurrentPhone(phoneNumber);
    setPhoneNumber('');
  };
