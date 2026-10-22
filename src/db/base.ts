import * as SQLite from 'expo-sqlite';
import { CONTAR_ATRIBUTOS, ESQUEMA, GUARDAR_ATRIBUTO } from './consultas';

let conexion: Promise<SQLite.SQLiteDatabase> | null = null;

const abrir = async () => {
  const base = await SQLite.openDatabaseAsync('turnero.db');
  await base.execAsync(ESQUEMA);

  const fila = await base.getFirstAsync<{ total: number }>(CONTAR_ATRIBUTOS);
  if (!fila || fila.total === 0) {
    await base.runAsync(GUARDAR_ATRIBUTO, 1, 'nombre', 'Titular');
    await base.runAsync(GUARDAR_ATRIBUTO, 1, 'parentesco', 'Titular');
  }

  return base;
};

export const obtenerBase = () => {
  conexion ??= abrir();
  return conexion;
};
