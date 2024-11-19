export interface IJSON {
  destino: number;
  anexo: ILog[];
}

export interface ILog {
  date: string;
  duration: number;
  name?: string;
  phoneNumber: string;
  rawType: number;
  timestamp: string;
  type: string;
}
