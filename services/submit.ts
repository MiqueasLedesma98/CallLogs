import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {requestCallLogPermission} from '../helpers/permissions';
import DB from '../sqlite';
import {getCallLogs, startTask} from '../helpers/tasks';
import {DELAY} from '../variables';

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
      DB.executeQuery('INSERT INTO device (phone) VALUES (?);', [
        phoneNumber,
      ]).then(() =>
        requestCallLogPermission().then(value => {
          if (value) {
            setPermission(value);
            ReactNativeForegroundService.add_task(getCallLogs, {
              delay: DELAY,
              onLoop: true,
              taskId: 'taskid',
              onSuccess: () => {},
              // @ts-ignore
              onError: e => console.log('Error logging:', e),
            });
            startTask();
          }
        }),
      );
    setCurrentPhone(phoneNumber);
    setPhoneNumber('');
  };
