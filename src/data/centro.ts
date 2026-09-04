import { Centro, Especialidad, Metrica, Profesional } from '../types';

export const centro: Centro = {
  nombre: 'Turnero San Rafael',
  sede: 'Sede Centro - Av. Colon 1240',
  fecha: 'Lunes 8 de septiembre',
};

export const indicadores: Metrica[] = [
  { id: 'libres', valor: '18', etiqueta: 'Turnos libres', tono: 'exito' },
  { id: 'reservados', valor: '31', etiqueta: 'Reservados', tono: 'primario' },
  { id: 'espera', valor: '6', etiqueta: 'En sala de espera', tono: 'ocupado' },
];

export const especialidades: Especialidad[] = [
  { id: 'clinica', nombre: 'Clinica Medica', disponibles: 7 },
  { id: 'pediatria', nombre: 'Pediatria', disponibles: 4 },
  { id: 'cardiologia', nombre: 'Cardiologia', disponibles: 2 },
  { id: 'odontologia', nombre: 'Odontologia', disponibles: 5 },
  { id: 'kinesiologia', nombre: 'Kinesiologia', disponibles: 3 },
];

export const profesionales: Profesional[] = [
  {
    id: 1,
    nombre: 'Dra. Lucia Bermudez',
    especialidad: 'Clinica Medica',
    consultorio: 'Consultorio 3 - Planta baja',
    foto: 'https://i.pravatar.cc/300?img=47',
    valoracion: 4.8,
    cobertura: 'OSDE - Swiss Medical - Particular',
    horarios: [
      { hora: '08:30', ocupado: true },
      { hora: '09:15', ocupado: false },
      { hora: '10:00', ocupado: false },
      { hora: '11:30', ocupado: true },
    ],
  },
  {
    id: 2,
    nombre: 'Dr. Marcos Aguirre',
    especialidad: 'Cardiologia',
    consultorio: 'Consultorio 8 - Primer piso',
    foto: 'https://i.pravatar.cc/300?img=12',
    valoracion: 4.6,
    cobertura: 'PAMI - Particular',
    horarios: [
      { hora: '09:00', ocupado: true },
      { hora: '09:40', ocupado: true },
      { hora: '12:20', ocupado: false },
    ],
  },
  {
    id: 3,
    nombre: 'Dra. Paula Riquelme',
    especialidad: 'Pediatria',
    consultorio: 'Consultorio 1 - Ala infantil',
    foto: 'https://i.pravatar.cc/300?img=32',
    valoracion: 4.9,
    cobertura: 'OSDE - Galeno - Particular',
    horarios: [
      { hora: '08:00', ocupado: false },
      { hora: '08:45', ocupado: false },
      { hora: '10:30', ocupado: true },
      { hora: '13:00', ocupado: false },
    ],
  },
  {
    id: 4,
    nombre: 'Dr. Nicolas Ferrari',
    especialidad: 'Odontologia',
    consultorio: 'Consultorio 5 - Planta baja',
    foto: 'https://i.pravatar.cc/300?img=59',
    valoracion: 4.4,
    cobertura: 'Swiss Medical - Particular',
    horarios: [
      { hora: '14:00', ocupado: false },
      { hora: '14:45', ocupado: true },
      { hora: '16:10', ocupado: false },
    ],
  },
  {
    id: 5,
    nombre: 'Lic. Camila Ortiz',
    especialidad: 'Kinesiologia',
    consultorio: 'Sala 2 - Rehabilitacion',
    foto: 'https://i.pravatar.cc/300?img=25',
    valoracion: 4.7,
    cobertura: 'PAMI - Galeno - Particular',
    horarios: [
      { hora: '15:30', ocupado: false },
      { hora: '16:15', ocupado: false },
      { hora: '17:00', ocupado: true },
    ],
  },
];
