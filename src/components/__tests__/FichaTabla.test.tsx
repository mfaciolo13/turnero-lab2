import { fireEvent, render, screen } from '@testing-library/react-native';
import { Atributo } from '../../types';
import FichaTabla from '../FichaTabla';

const atributos: Atributo[] = [
  { attribute: 'nombre', value: 'Lucia' },
  { attribute: 'obra_social', value: 'OSDE' },
  { attribute: 'alergias', value: null },
];

const acciones = { onEditar: jest.fn(), onBorrar: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FichaTabla', () => {
  it('muestra una fila por cada dato con su nombre legible y su valor', async () => {
    await render(<FichaTabla atributos={atributos} {...acciones} />);

    expect(screen.getByText('Nombre')).toBeOnTheScreen();
    expect(screen.getByText('Lucia')).toBeOnTheScreen();
    expect(screen.getByText('Obra social')).toBeOnTheScreen();
    expect(screen.getByText('OSDE')).toBeOnTheScreen();
  });

  it('muestra un guion cuando el valor está vacío', async () => {
    await render(<FichaTabla atributos={atributos} {...acciones} />);

    expect(screen.getByText('-')).toBeOnTheScreen();
  });

  it('avisa que no hay datos cuando la lista está vacía', async () => {
    await render(<FichaTabla atributos={[]} {...acciones} />);

    expect(screen.getByText('Todavía no cargaste ningún dato.')).toBeOnTheScreen();
  });

  it('edita el dato que se toca', async () => {
    await render(<FichaTabla atributos={atributos} {...acciones} />);

    await fireEvent.press(screen.getByTestId('editar-obra_social'));

    expect(acciones.onEditar).toHaveBeenCalledWith({ attribute: 'obra_social', value: 'OSDE' });
  });

  it('borra el dato que se toca', async () => {
    await render(<FichaTabla atributos={atributos} {...acciones} />);

    await fireEvent.press(screen.getByTestId('borrar-obra_social'));

    expect(acciones.onBorrar).toHaveBeenCalledWith({ attribute: 'obra_social', value: 'OSDE' });
  });

  it('no deja borrar el nombre porque la ficha dejaría de existir', async () => {
    await render(<FichaTabla atributos={atributos} {...acciones} />);

    expect(screen.queryByTestId('borrar-nombre')).toBeNull();
    expect(screen.getByTestId('editar-nombre')).toBeOnTheScreen();
  });
});
