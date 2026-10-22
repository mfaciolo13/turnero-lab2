import { fireEvent, render, screen } from '@testing-library/react-native';
import { Paciente } from '../../types';
import SelectorPacientes from '../SelectorPacientes';

const pacientes: Paciente[] = [
  { id: 1, nombre: 'Mayco', parentesco: 'Titular', obraSocial: null, afiliado: null },
  { id: 2, nombre: 'Lucia', parentesco: 'Hija', obraSocial: null, afiliado: null },
];

const acciones = { onSeleccionar: jest.fn(), onAgregar: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SelectorPacientes', () => {
  it('muestra a cada paciente con su parentesco', async () => {
    await render(<SelectorPacientes pacientes={pacientes} seleccionado={1} {...acciones} />);

    expect(screen.getByText('Mayco')).toBeOnTheScreen();
    expect(screen.getByText('Titular')).toBeOnTheScreen();
    expect(screen.getByText('Lucia')).toBeOnTheScreen();
    expect(screen.getByText('Hija')).toBeOnTheScreen();
  });

  it('selecciona al paciente que se toca', async () => {
    await render(<SelectorPacientes pacientes={pacientes} seleccionado={1} {...acciones} />);

    await fireEvent.press(screen.getByTestId('paciente-2'));

    expect(acciones.onSeleccionar).toHaveBeenCalledWith(2);
  });

  it('ofrece agregar un familiar', async () => {
    await render(<SelectorPacientes pacientes={pacientes} seleccionado={1} {...acciones} />);

    await fireEvent.press(screen.getByTestId('agregar-familiar'));

    expect(acciones.onAgregar).toHaveBeenCalledTimes(1);
  });

  it('no muestra el parentesco cuando está vacío', async () => {
    await render(
      <SelectorPacientes
        pacientes={[{ ...pacientes[0], parentesco: '' }]}
        seleccionado={1}
        {...acciones}
      />,
    );

    expect(screen.queryByText('Titular')).toBeNull();
  });
});
