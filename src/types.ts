export type Tono = 'exito' | 'primario' | 'ocupado';

export type Centro = {
  nombre: string;
  sede: string;
  fecha: string;
};

export type Metrica = {
  id: string;
  valor: string;
  etiqueta: string;
  tono: Tono;
};

export type Especialidad = {
  id: string;
  nombre: string;
  disponibles: number;
};

export type Horario = {
  hora: string;
  ocupado: boolean;
};

export type Profesional = {
  id: number;
  nombre: string;
  especialidad: string;
  consultorio: string;
  foto: string;
  valoracion: number;
  cobertura: string;
  horarios: Horario[];
};
