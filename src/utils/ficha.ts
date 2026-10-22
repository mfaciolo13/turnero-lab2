import { Atributo } from '../types';

export const SUGERENCIAS = [
  'obra_social',
  'afiliado',
  'grupo_sanguineo',
  'alergias',
  'medicacion',
  'contacto_emergencia',
];

export const ATRIBUTO_NOMBRE = 'nombre';

export const PACIENTE_TITULAR = 1;

export const normalizarAtributo = (texto: string) =>
  texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const etiquetaDe = (atributo: string) => {
  const texto = atributo.replace(/_/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export const pivotear = (atributos: Atributo[]) =>
  Object.fromEntries(atributos.map((item) => [item.attribute, item.value ?? '']));
