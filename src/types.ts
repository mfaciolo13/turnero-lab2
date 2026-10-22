export type Tono = 'exito' | 'primario' | 'ocupado';

export type Coordenadas = {
  latitude: number;
  longitude: number;
};

export type Ubicacion = Coordenadas & {
  lugar?: string;
};

export type Centro = {
  nombre: string;
  sede: string;
  fecha: string;
  coordenadas: Coordenadas;
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
};

export type ResumenEspecialidad = Especialidad & {
  profesionales: number;
  disponibles: number;
  ocupados: number;
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
  telefono: string;
  horarios: Horario[];
};

export type Atributo = {
  attribute: string;
  value: string | null;
};

export type Paciente = {
  id: number;
  nombre: string;
  parentesco: string;
  obraSocial: string | null;
  afiliado: string | null;
};

export type Reserva = {
  id: string;
  pacienteId: number;
  profesionalId: number;
  profesional: string;
  especialidad: string;
  consultorio: string;
  foto: string;
  hora: string;
  orden: string | null;
};
