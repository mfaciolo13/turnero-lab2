import { Paciente, Reserva } from '../../types';
import { textoComprobante } from '../comprobante';

const reserva: Reserva = {
  id: '1-08:00',
  pacienteId: 1,
  profesionalId: 1,
  profesional: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2 - Primer piso',
  foto: 'https://dummyjson.com/icon/emilys/128',
  hora: '08:00',
  orden: null,
};

const paciente: Paciente = {
  id: 1,
  nombre: 'Lucia',
  parentesco: 'Hija',
  obraSocial: null,
  afiliado: null,
};

describe('textoComprobante', () => {
  it('incluye el sello, el profesional, la hora y el consultorio', () => {
    const texto = textoComprobante(reserva, null, '✅');

    expect(texto).toContain('✅ Turno confirmado');
    expect(texto).toContain('Dra. Emily Johnson - Pediatria');
    expect(texto).toContain('Hoy a las 08:00 hs');
    expect(texto).toContain('Consultorio 2 - Primer piso');
  });

  it('agrega el nombre del paciente cuando se conoce', () => {
    expect(textoComprobante(reserva, paciente, '🩺')).toContain('Paciente: Lucia');
  });

  it('no menciona al paciente si no se conoce', () => {
    expect(textoComprobante(reserva, null, '🩺')).not.toContain('Paciente');
  });

  it('pone cada dato en su propia línea', () => {
    expect(textoComprobante(reserva, paciente, '✅').split('\n')).toHaveLength(5);
  });
});
