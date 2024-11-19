import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {requestCallLogPermission} from './helpers/permissions';
import DB from './sqlite';
import React, {useState} from 'react';
import usePermissions from './hooks/usePermissions';
import {handleSubmit} from './services/submit';
import {sendData} from './api';

DB.createTable();
// DB.resetDatabase();

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const {
    currentPhone,
    permission,
    setPermission,
    setCurrentPhone,
    currentConfig,
  } = usePermissions();
  const [loading, setLoading] = useState(false);

  const handleHistory = async () => {
    try {
      setLoading(true);
      await sendData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={style.container}>
      <View>
        <Text>{permission ? 'Tienes permisos' : 'No tienes permisos'}</Text>
        <Text>{permission && 'Puedes cerrar la aplicación'}</Text>
        <Text>{currentPhone}</Text>
        <Text style={style.timeText}>
          {permission &&
            `Tiempo actualización de ${currentConfig.delay ?? 1} minuto`}
        </Text>
      </View>

      {!permission && (
        <>
          <TextInput
            keyboardType="number-pad"
            onChangeText={text => setPhoneNumber(text)}
            placeholder="Ingrese número de telefono"
          />
          <Button
            title="Guardar"
            onPress={handleSubmit({
              phoneNumber,
              setCurrentPhone,
              setPermission,
              setPhoneNumber,
            })}
          />
        </>
      )}

      {permission && (
        <>
          <Button
            title="Borrar número"
            onPress={() =>
              DB.executeQuery('DELETE FROM device WHERE 1=1;').then(() =>
                requestCallLogPermission().then(setPermission),
              )
            }
          />
          <View style={style.updateHistory}>
            <Button title="Actualiza historico" onPress={handleHistory} />
            {loading && <ActivityIndicator size="large" color="#e1ff00" />}
          </View>
        </>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    gap: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: '#e6f207',
  },
  updateHistory: {
    marginTop: 50,
  },
});
