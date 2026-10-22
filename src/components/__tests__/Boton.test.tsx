import { fireEvent, render, screen } from '@testing-library/react-native';
import Boton from '../Boton';

describe('Boton', () => {
  it('muestra su título', async () => {
    await render(<Boton titulo="Guardar" onPress={jest.fn()} />);

    expect(screen.getByText('Guardar')).toBeOnTheScreen();
  });

  it('ejecuta la acción al tocarlo', async () => {
    const onPress = jest.fn();
    await render(<Boton titulo="Guardar" onPress={onPress} testID="boton" />);

    await fireEvent.press(screen.getByTestId('boton'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta la acción si está deshabilitado', async () => {
    const onPress = jest.fn();
    await render(<Boton titulo="Guardar" onPress={onPress} testID="boton" deshabilitado />);

    await fireEvent.press(screen.getByTestId('boton'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('se muestra como deshabilitado cuando corresponde', async () => {
    await render(<Boton titulo="Guardar" onPress={jest.fn()} testID="boton" deshabilitado />);

    expect(screen.getByTestId('boton')).toBeDisabled();
  });

  it('funciona con cada variante', async () => {
    await render(
      <>
        <Boton titulo="Uno" variante="primario" onPress={jest.fn()} />
        <Boton titulo="Dos" variante="secundario" onPress={jest.fn()} />
        <Boton titulo="Tres" variante="peligro" icono="trash" onPress={jest.fn()} />
      </>,
    );

    expect(screen.getByText('Uno')).toBeOnTheScreen();
    expect(screen.getByText('Dos')).toBeOnTheScreen();
    expect(screen.getByText('Tres')).toBeOnTheScreen();
  });
});
