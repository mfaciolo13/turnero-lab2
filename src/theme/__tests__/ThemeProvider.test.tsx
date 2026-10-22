import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { tema } from '../tema';

const Color = () => <Text testID="color">{useTheme().colores.primario}</Text>;

describe('ThemeProvider', () => {
  it('entrega el tema por defecto aunque no haya un proveedor', async () => {
    await render(<Color />);

    expect(screen.getByTestId('color')).toHaveTextContent(tema.colores.primario);
  });

  it('entrega el tema que recibe el proveedor', async () => {
    const oscuro = { ...tema, colores: { ...tema.colores, primario: '#000000' } };

    await render(
      <ThemeProvider theme={oscuro}>
        <Color />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('color')).toHaveTextContent('#000000');
  });

  it('usa el proveedor más cercano cuando hay varios anidados', async () => {
    const uno = { ...tema, colores: { ...tema.colores, primario: '#111111' } };
    const dos = { ...tema, colores: { ...tema.colores, primario: '#222222' } };

    await render(
      <ThemeProvider theme={uno}>
        <ThemeProvider theme={dos}>
          <Color />
        </ThemeProvider>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('color')).toHaveTextContent('#222222');
  });

  it('define los espacios, radios y fuentes que usan los componentes', () => {
    expect(tema.espacio.grande).toBeGreaterThan(tema.espacio.medio);
    expect(tema.radio.total).toBeGreaterThan(tema.radio.grande);
    expect(tema.fuente.titulo).toBeGreaterThan(tema.fuente.normal);
  });
});
