import {useEffect, useState} from 'react';
import DB from '../sqlite';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {getCallLogs, startTask, stopTask} from '../helpers/tasks';
import {requestCallLogPermission} from '../helpers/permissions';
import {getConfig} from '../api';
import {IConfig} from '../interfaces/IConfig';

const usePermissions = () => {
  const [permission, setPermission] = useState(false);
  const [currentPhone, setCurrentPhone] = useState('');
  const [currentConfig, setCurrentConfig] = useState<IConfig>({
    delay: 1,
    lim: 50,
  });

  useEffect(() => {
    if (permission)
      DB.executeQuery('SELECT * FROM device LIMIT 1;')
        .then(data => {
          if (data[0]) {
            getConfig().then(config => {
              if (!config) throw new Error('Falla al configurar el servicio');

              ReactNativeForegroundService.add_task(getCallLogs, {
                delay: config.delay * 1000 * 60,
                onLoop: true,
                taskId: 'taskid',
                onSuccess: () => {},
                // @ts-ignore
                onError: e => console.log('Error logging:', e),
              });

              setCurrentConfig({...config[0]});
              setCurrentPhone(data[0].phone);
              startTask();
            });
          } else {
            stopTask();
            setCurrentPhone('');
          }
        })
        .catch(console.error);
    else {
      setCurrentPhone('');
      stopTask();
    }
  }, [permission]);

  useEffect(() => {
    requestCallLogPermission().then(p => {
      if (!p) {
        DB.executeQuery('DELETE FROM device WHERE 1=1;');
      } else {
        setPermission(p);
        getConfig();
      }
    });
  }, []);

  useEffect(() => {
    DB.executeQuery('SELECT * FROM device LIMIT 1;').then(data => {
      if (data[0]) setCurrentPhone(data[0].phone);
    });
  }, []);

  return {
    permission,
    currentPhone,
    setPermission,
    setCurrentPhone,
    currentConfig,
    setCurrentConfig,
  };
};

export default usePermissions;
