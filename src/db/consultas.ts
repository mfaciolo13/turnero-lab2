export const ESQUEMA = `
CREATE TABLE IF NOT EXISTS entity_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  attribute TEXT NOT NULL,
  value TEXT,
  UNIQUE (entity_id, attribute)
);

CREATE TABLE IF NOT EXISTS reservas (
  id TEXT PRIMARY KEY,
  paciente_id INTEGER NOT NULL,
  profesional_id INTEGER NOT NULL,
  profesional TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  consultorio TEXT NOT NULL,
  foto TEXT NOT NULL,
  hora TEXT NOT NULL,
  orden TEXT
);

CREATE VIEW IF NOT EXISTS vw_pacientes AS
SELECT entity_id,
  MAX(CASE WHEN attribute = 'nombre' THEN value END) AS nombre,
  MAX(CASE WHEN attribute = 'parentesco' THEN value END) AS parentesco,
  MAX(CASE WHEN attribute = 'obra_social' THEN value END) AS obra_social,
  MAX(CASE WHEN attribute = 'afiliado' THEN value END) AS afiliado
FROM entity_attributes
GROUP BY entity_id;
`;

export const CONTAR_ATRIBUTOS = `SELECT COUNT(*) AS total FROM entity_attributes`;

export const PACIENTES = `SELECT * FROM vw_pacientes ORDER BY entity_id`;

export const PACIENTE_POR_ID = `SELECT * FROM vw_pacientes WHERE entity_id = ?`;

export const ATRIBUTOS_DE = `SELECT attribute, value FROM entity_attributes WHERE entity_id = ? ORDER BY id`;

export const GUARDAR_ATRIBUTO = `
INSERT INTO entity_attributes (entity_id, attribute, value) VALUES (?, ?, ?)
ON CONFLICT (entity_id, attribute) DO UPDATE SET value = excluded.value
`;

export const BORRAR_ATRIBUTO = `DELETE FROM entity_attributes WHERE entity_id = ? AND attribute = ?`;

export const BORRAR_ENTIDAD = `DELETE FROM entity_attributes WHERE entity_id = ?`;

export const PROXIMO_ENTITY_ID = `SELECT COALESCE(MAX(entity_id), 0) + 1 AS proximo FROM entity_attributes`;

export const LISTAR_RESERVAS = `SELECT * FROM reservas ORDER BY hora`;

export const INSERTAR_RESERVA = `
INSERT INTO reservas
  (id, paciente_id, profesional_id, profesional, especialidad, consultorio, foto, hora, orden)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const BORRAR_RESERVA = `DELETE FROM reservas WHERE id = ?`;

export const BORRAR_RESERVAS_DE_PACIENTE = `DELETE FROM reservas WHERE paciente_id = ?`;

export const GUARDAR_ORDEN = `UPDATE reservas SET orden = ? WHERE id = ?`;
