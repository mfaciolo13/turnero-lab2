type Parametro = string | number | null;

type Sentencia = {
  all: (...parametros: Parametro[]) => unknown[];
  get: (...parametros: Parametro[]) => unknown;
  run: (...parametros: Parametro[]) => unknown;
};

type BaseNode = {
  exec: (sql: string) => void;
  prepare: (sql: string) => Sentencia;
};

type ConstructorBase = new (ruta: string) => BaseNode;

const { DatabaseSync } = (
  process as unknown as { getBuiltinModule: (nombre: string) => { DatabaseSync: ConstructorBase } }
).getBuiltinModule('node:sqlite');

export const openDatabaseAsync = async () => {
  const base = new DatabaseSync(':memory:');

  return {
    execAsync: async (sql: string) => base.exec(sql),
    getAllAsync: async (sql: string, ...parametros: Parametro[]) =>
      base.prepare(sql).all(...parametros),
    getFirstAsync: async (sql: string, ...parametros: Parametro[]) =>
      base.prepare(sql).get(...parametros) ?? null,
    runAsync: async (sql: string, ...parametros: Parametro[]) =>
      base.prepare(sql).run(...parametros),
    withTransactionAsync: async (tarea: () => Promise<void>) => {
      base.exec('BEGIN');
      try {
        await tarea();
        base.exec('COMMIT');
      } catch (error) {
        base.exec('ROLLBACK');
        throw error;
      }
    },
  };
};
