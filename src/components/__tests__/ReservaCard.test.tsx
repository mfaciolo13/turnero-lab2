import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ReservaCard from '../ReservaCard';

const props = {
  profesional: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2 - Primer piso',
  foto: 'https://dummyjson.com/icon/emilys/128',
  hora: '09:20',
  tieneOrden: false,
  saliendo: false,
  onPress: jest.fn(),
  onCancelar: jest.fn(),
  onSalio: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ReservaCard', () => {
  it('muestra la hora, el profesional y el consultorio', async () => {
    await render(<ReservaCard {...props} />);

    expect(screen.getByText('09:20')).toBeOnTheScreen();
    expect(screen.getByText('Dra. Emily Johnson')).toBeOnTheScreen();
    expect(screen.getByText('Pediatria')).toBeOnTheScreen();
    expect(screen.getByText('Consultorio 2 - Primer piso')).toBeOnTheScreen();
  });

  it('avisa que falta la orden médica', async () => {
    await render(<ReservaCard {...props} />);

    expect(screen.getByText('Sin orden')).toBeOnTheScreen();
  });

  it('avisa que la orden médica ya está adjunta', async () => {
    await render(<ReservaCard {...props} tieneOrden />);

    expect(screen.getByText('Orden adjunta')).toBeOnTheScreen();
    expect(screen.queryByText('Sin orden')).toBeNull();
  });

  it('abre el comprobante al tocar la tarjeta', async () => {
    await render(<ReservaCard {...props} />);

    await fireEvent.press(screen.getByText('Dra. Emily Johnson'));

    expect(props.onPress).toHaveBeenCalledTimes(1);
  });

  it('pide cancelar con el botón del tacho sin abrir el comprobante', async () => {
    await render(<ReservaCard {...props} />);

    await fireEvent.press(screen.getByTestId('cancelar-turno'));

    expect(props.onCancelar).toHaveBeenCalledTimes(1);
    expect(props.onPress).not.toHaveBeenCalled();
  });

  it('no avisa que salió mientras no se está yendo', async () => {
    await render(<ReservaCard {...props} />);

    expect(props.onSalio).not.toHaveBeenCalled();
  });

  it('avisa cuando termina de salir de la lista', async () => {
    await render(<ReservaCard {...props} saliendo />);

    await waitFor(() => expect(props.onSalio).toHaveBeenCalledTimes(1));
  });
});
