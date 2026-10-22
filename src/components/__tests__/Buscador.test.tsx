import { fireEvent, render, screen } from '@testing-library/react-native';
import Buscador from '../Buscador';

describe('Buscador', () => {
  it('muestra el texto de ayuda cuando está vacío', async () => {
    await render(<Buscador valor="" onCambiar={jest.fn()} placeholder="Buscar por nombre" />);

    expect(screen.getByPlaceholderText('Buscar por nombre')).toBeOnTheScreen();
  });

  it('avisa cada vez que el usuario escribe', async () => {
    const onCambiar = jest.fn();
    await render(<Buscador valor="" onCambiar={onCambiar} placeholder="Buscar" />);

    await fireEvent.changeText(screen.getByTestId('input-busqueda'), 'emma');

    expect(onCambiar).toHaveBeenCalledWith('emma');
  });

  it('muestra el texto que recibe', async () => {
    await render(<Buscador valor="emma" onCambiar={jest.fn()} placeholder="Buscar" />);

    expect(screen.getByTestId('input-busqueda')).toHaveDisplayValue('emma');
  });

  it('no muestra el botón de limpiar si no hay texto', async () => {
    await render(<Buscador valor="" onCambiar={jest.fn()} placeholder="Buscar" />);

    expect(screen.queryByTestId('limpiar-busqueda')).toBeNull();
  });

  it('borra el texto al tocar el botón de limpiar', async () => {
    const onCambiar = jest.fn();
    await render(<Buscador valor="emma" onCambiar={onCambiar} placeholder="Buscar" />);

    await fireEvent.press(screen.getByTestId('limpiar-busqueda'));

    expect(onCambiar).toHaveBeenCalledWith('');
  });
});
