import { etiquetaDe, normalizarAtributo, pivotear } from '../ficha';

describe('normalizarAtributo', () => {
  it('pasa a minúsculas y reemplaza los espacios por guiones bajos', () => {
    expect(normalizarAtributo('Obra Social')).toBe('obra_social');
  });

  it('quita los acentos', () => {
    expect(normalizarAtributo('Grupo sanguíneo')).toBe('grupo_sanguineo');
  });

  it('ignora los espacios de más y los símbolos', () => {
    expect(normalizarAtributo('  Contacto   de emergencia! ')).toBe('contacto_de_emergencia');
  });

  it('devuelve vacío si no queda ningún carácter válido', () => {
    expect(normalizarAtributo('???')).toBe('');
    expect(normalizarAtributo('')).toBe('');
  });

  it('deja igual un atributo que ya está normalizado', () => {
    expect(normalizarAtributo('obra_social')).toBe('obra_social');
  });
});

describe('etiquetaDe', () => {
  it('muestra el atributo con mayúscula inicial y espacios', () => {
    expect(etiquetaDe('grupo_sanguineo')).toBe('Grupo sanguineo');
  });

  it('funciona con una sola palabra', () => {
    expect(etiquetaDe('nombre')).toBe('Nombre');
  });
});

describe('pivotear', () => {
  it('convierte las filas verticales en un objeto', () => {
    const registro = pivotear([
      { attribute: 'nombre', value: 'Lucia' },
      { attribute: 'parentesco', value: 'Hija' },
    ]);

    expect(registro).toEqual({ nombre: 'Lucia', parentesco: 'Hija' });
  });

  it('usa texto vacío cuando el valor es nulo', () => {
    expect(pivotear([{ attribute: 'alergias', value: null }])).toEqual({ alergias: '' });
  });

  it('devuelve un objeto vacío si no hay atributos', () => {
    expect(pivotear([])).toEqual({});
  });
});
