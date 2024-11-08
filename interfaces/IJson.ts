interface IJSON {
  phone: string;
  logs: ILog[];
}

interface ILog {
  date: string;
  duration: number;
  name?: string;
  phoneNumber: string;
  rawType: number;
  timestamp: string;
  type: string;
}
