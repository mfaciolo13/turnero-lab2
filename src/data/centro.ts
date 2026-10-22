import { Centro, Especialidad } from '../types';

export const centro: Centro = {
  nombre: 'Turnero Laboratorio 2',
  sede: 'Sede Centro - Av. Colon 1240',
  fecha: 'Agenda de hoy',
  coordenadas: { latitude: -31.4124, longitude: -64.1833 },
};

export const especialidades: Especialidad[] = [
  { id: 'clinica', nombre: 'Clinica Medica' },
  { id: 'pediatria', nombre: 'Pediatria' },
  { id: 'cardiologia', nombre: 'Cardiologia' },
  { id: 'odontologia', nombre: 'Odontologia' },
  { id: 'kinesiologia', nombre: 'Kinesiologia' },
];

export const coberturas = [
  'OSDE - Swiss Medical - Particular',
  'PAMI - Particular',
  'OSDE - Galeno - Particular',
  'Swiss Medical - Particular',
  'PAMI - Galeno - Particular',
];

export const horariosDelCentro = [
  '08:00',
  '08:40',
  '09:20',
  '10:00',
  '10:40',
  '11:20',
  '14:00',
  '14:40',
  '15:20',
  '16:00',
  '16:40',
  '17:20',
];
