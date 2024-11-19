/**
 * @description - Es la url a donde se envia el registro de llamadas
 */
export const URL_FETCH =
  'https://8vrc0qsr4e.execute-api.us-east-1.amazonaws.com/call-pbx-insert-apk';

/**
 * @description - Es el delay de tiempo en minutos entre cada llamada (NO PUEDE SER DECIMALES)
 */
export const DELAY = 1;

/**
 * @description - Cantidad de registros a obtener por cada llamada
 */
export const LIMIT = 50;

/**
 * @description - URL para traer la configuración del servidor
 */
export let URL_CONFIG: string | false = false; // Aquí agregar la url de la configuración del servidor
