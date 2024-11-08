import React, {useEffect, useState} from 'react';
import DB from '../sqlite';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {DELAY} from '../variables';
import {getCallLogs, startTask, stopTask} from '../helpers/tasks';
import {requestCallLogPermission} from '../helpers/permissions';

const usePermissions = () => {
  const [permission, setPermission] = useState(false);
  const [currentPhone, setCurrentPhone] = useState('');
  const [currentConfig, setCurrentConfig] = useState<IConfig>({});

  useEffect(() => {
    if (permission)
      DB.executeQuery('SELECT * FROM device LIMIT 1;')
        .then(data => {
          if (data[0]) {
            ReactNativeForegroundService.add_task(getCallLogs, {
              delay: DELAY,
              onLoop: true,
              taskId: 'taskid',
              onSuccess: () => {},
              // @ts-ignore
              onError: e => console.log('Error logging:', e),
            });

            setCurrentPhone(data[0].phone);
            startTask();
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
        // TODO: Agregar otra peticion para traer config
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
