import { obtenerBase } from './base';
import {
  ATRIBUTOS_DE,
  BORRAR_ATRIBUTO,
  BORRAR_ENTIDAD,
  BORRAR_RESERVAS_DE_PACIENTE,
  GUARDAR_ATRIBUTO,
  PACIENTES,
  PACIENTE_POR_ID,
  PROXIMO_ENTITY_ID,
} from './consultas';
import { Atributo, Paciente } from '../types';

type FilaPaciente = {
  entity_id: number;
  nombre: string | null;
  parentesco: string | null;
  obra_social: string | null;
  afiliado: string | null;
};

const aPaciente = (fila: FilaPaciente): Paciente => ({
  id: fila.entity_id,
  nombre: fila.nombre ?? 'Sin nombre',
  parentesco: fila.parentesco ?? '',
  obraSocial: fila.obra_social,
  afiliado: fila.afiliado,
});

export const listarPacientes = async () => {
  const base = await obtenerBase();
  const filas = await base.getAllAsync<FilaPaciente>(PACIENTES);
  return filas.map(aPaciente);
};

export const obtenerPaciente = async (id: number) => {
  const base = await obtenerBase();
  const fila = await base.getFirstAsync<FilaPaciente>(PACIENTE_POR_ID, id);
  return fila ? aPaciente(fila) : null;
};

export const listarAtributos = async (id: number) => {
  const base = await obtenerBase();
  return base.getAllAsync<Atributo>(ATRIBUTOS_DE, id);
};

export const guardarAtributo = async (id: number, atributo: string, valor: string) => {
  const base = await obtenerBase();
  await base.runAsync(GUARDAR_ATRIBUTO, id, atributo, valor);
};

export const borrarAtributo = async (id: number, atributo: string) => {
  const base = await obtenerBase();
  await base.runAsync(BORRAR_ATRIBUTO, id, atributo);
};

export const crearPaciente = async (nombre: string, parentesco: string) => {
  const base = await obtenerBase();
  let id = 0;

  await base.withTransactionAsync(async () => {
    const fila = await base.getFirstAsync<{ proximo: number }>(PROXIMO_ENTITY_ID);
    id = fila?.proximo ?? 1;
    await base.runAsync(GUARDAR_ATRIBUTO, id, 'nombre', nombre);
    await base.runAsync(GUARDAR_ATRIBUTO, id, 'parentesco', parentesco);
  });

  return id;
};

export const borrarPaciente = async (id: number) => {
  const base = await obtenerBase();

  await base.withTransactionAsync(async () => {
    await base.runAsync(BORRAR_RESERVAS_DE_PACIENTE, id);
    await base.runAsync(BORRAR_ENTIDAD, id);
  });
};
