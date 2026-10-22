import { agruparPorFranja } from '../franjas';

describe('agruparPorFranja', () => {
  it('separa los horarios de la mañana y de la tarde', () => {
    const franjas = agruparPorFranja([{ hora: '08:00' }, { hora: '12:40' }, { hora: '14:00' }]);

    expect(franjas.map((franja) => franja.titulo)).toEqual(['Mañana', 'Tarde']);
    expect(franjas[0].data).toHaveLength(2);
    expect(franjas[1].data).toHaveLength(1);
  });

  it('toma las 13:00 como parte de la tarde', () => {
    const franjas = agruparPorFranja([{ hora: '12:59' }, { hora: '13:00' }]);

    expect(franjas[0].data).toEqual([{ hora: '12:59' }]);
    expect(franjas[1].data).toEqual([{ hora: '13:00' }]);
  });

  it('omite la franja que no tiene horarios', () => {
    const franjas = agruparPorFranja([{ hora: '09:00' }]);

    expect(franjas).toHaveLength(1);
    expect(franjas[0].titulo).toBe('Mañana');
  });

  it('devuelve una lista vacía si no hay horarios', () => {
    expect(agruparPorFranja([])).toEqual([]);
  });

  it('conserva los demás datos de cada elemento', () => {
    const franjas = agruparPorFranja([{ hora: '10:00', ocupado: true }]);

    expect(franjas[0].data[0]).toEqual({ hora: '10:00', ocupado: true });
  });
});
