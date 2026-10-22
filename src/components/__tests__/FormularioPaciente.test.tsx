import { fireEvent, render, screen } from '@testing-library/react-native';
import FormularioPaciente from '../FormularioPaciente';

const acciones = { onCrear: jest.fn(), onCancelar: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FormularioPaciente', () => {
  it('empieza con el botón deshabilitado', async () => {
    await render(<FormularioPaciente guardando={false} {...acciones} />);

    expect(screen.getByTestId('boton-crear-familiar')).toBeDisabled();
  });

  it('se habilita con solo escribir el nombre', async () => {
    await render(<FormularioPaciente guardando={false} {...acciones} />);

    await fireEvent.changeText(screen.getByTestId('input-nombre-familiar'), 'Lucia');

    expect(screen.getByTestId('boton-crear-familiar')).toBeEnabled();
  });

  it('no se habilita con un nombre de solo espacios', async () => {
    await render(<FormularioPaciente guardando={false} {...acciones} />);

    await fireEvent.changeText(screen.getByTestId('input-nombre-familiar'), '   ');

    expect(screen.getByTestId('boton-crear-familiar')).toBeDisabled();
  });

  it('crea al familiar con el nombre y el parentesco sin espacios sobrantes', async () => {
    await render(<FormularioPaciente guardando={false} {...acciones} />);

    await fireEvent.changeText(screen.getByTestId('input-nombre-familiar'), '  Lucia ');
    await fireEvent.changeText(screen.getByTestId('input-parentesco-familiar'), ' Hija  ');
    await fireEvent.press(screen.getByTestId('boton-crear-familiar'));

    expect(acciones.onCrear).toHaveBeenCalledWith('Lucia', 'Hija');
  });

  it('permite crear sin indicar el parentesco', async () => {
    await render(<FormularioPaciente guardando={false} {...acciones} />);

    await fireEvent.changeText(screen.getByTestId('input-nombre-familiar'), 'Lucia');
    await fireEvent.press(screen.getByTestId('boton-crear-familiar'));

    expect(acciones.onCrear).toHaveBeenCalledWith('Lucia', '');
  });

  it('se deshabilita mientras se está guardando', async () => {
    await render(<FormularioPaciente guardando {...acciones} />);

    await fireEvent.changeText(screen.getByTestId('input-nombre-familiar'), 'Lucia');

    expect(screen.getByTestId('boton-crear-familiar')).toBeDisabled();
  });

  it('permite cancelar', async () => {
    await render(<FormularioPaciente guardando={false} {...acciones} />);

    await fireEvent.press(screen.getByText('Cancelar'));

    expect(acciones.onCancelar).toHaveBeenCalledTimes(1);
  });
});
