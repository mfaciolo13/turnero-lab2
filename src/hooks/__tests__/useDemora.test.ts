import { act, renderHook } from '@testing-library/react-native';
import { useDemora } from '../useDemora';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const avanzar = async (milisegundos: number) => {
  await act(async () => {
    jest.advanceTimersByTime(milisegundos);
  });
};

describe('useDemora', () => {
  it('devuelve el valor inicial enseguida', async () => {
    const { result } = await renderHook(() => useDemora('emma', 400));

    expect(result.current).toBe('emma');
  });

  it('espera antes de reflejar un valor nuevo', async () => {
    const { result, rerender } = await renderHook(
      ({ valor }: { valor: string }) => useDemora(valor, 400),
      {
        initialProps: { valor: 'e' },
      },
    );

    await rerender({ valor: 'em' });
    expect(result.current).toBe('e');

    await avanzar(399);
    expect(result.current).toBe('e');

    await avanzar(1);
    expect(result.current).toBe('em');
  });

  it('reinicia la espera cada vez que el valor cambia', async () => {
    const { result, rerender } = await renderHook(
      ({ valor }: { valor: string }) => useDemora(valor, 400),
      {
        initialProps: { valor: 'e' },
      },
    );

    await rerender({ valor: 'em' });
    await avanzar(300);
    await rerender({ valor: 'emm' });
    await avanzar(300);
    expect(result.current).toBe('e');

    await avanzar(100);
    expect(result.current).toBe('emm');
  });

  it('usa 400 milisegundos si no se indica otra espera', async () => {
    const { result, rerender } = await renderHook(
      ({ valor }: { valor: string }) => useDemora(valor),
      {
        initialProps: { valor: 'a' },
      },
    );

    await rerender({ valor: 'b' });
    await avanzar(399);
    expect(result.current).toBe('a');

    await avanzar(1);
    expect(result.current).toBe('b');
  });
});
