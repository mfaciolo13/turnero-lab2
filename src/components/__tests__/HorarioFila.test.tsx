import { fireEvent, render, screen } from '@testing-library/react-native';
import HorarioFila from '../HorarioFila';

const props = {
  hora: '09:20',
  ocupado: false,
  propio: false,
  onReservar: jest.fn(),
  onCancelar: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('HorarioFila libre', () => {
  it('muestra la hora y el botón para reservar', async () => {
    await render(<HorarioFila {...props} />);

    expect(screen.getByText('09:20')).toBeOnTheScreen();
    expect(screen.getByText('Reservar')).toBeOnTheScreen();
  });

  it('reserva al tocar el botón', async () => {
    await render(<HorarioFila {...props} />);

    await fireEvent.press(screen.getByText('Reservar'));

    expect(props.onReservar).toHaveBeenCalledTimes(1);
    expect(props.onCancelar).not.toHaveBeenCalled();
  });
});

describe('HorarioFila ocupado por otra persona', () => {
  it('muestra que ya está reservado y no ofrece reservar', async () => {
    await render(<HorarioFila {...props} ocupado />);

    expect(screen.getByText('Reservado')).toBeOnTheScreen();
    expect(screen.queryByText('Reservar')).toBeNull();
    expect(screen.queryByText('Cancelar')).toBeNull();
  });
});

describe('HorarioFila con el turno propio', () => {
  it('avisa que es tu turno y ofrece cancelarlo', async () => {
    await render(<HorarioFila {...props} ocupado propio />);

    expect(screen.getByText('Tu turno')).toBeOnTheScreen();
    expect(screen.getByText('Cancelar')).toBeOnTheScreen();
    expect(screen.queryByText('Reservar')).toBeNull();
  });

  it('cancela al tocar el botón', async () => {
    await render(<HorarioFila {...props} ocupado propio />);

    await fireEvent.press(screen.getByText('Cancelar'));

    expect(props.onCancelar).toHaveBeenCalledTimes(1);
  });

  it('pasa de libre a tu turno cuando se confirma la reserva', async () => {
    await render(<HorarioFila {...props} />);

    await screen.rerender(<HorarioFila {...props} ocupado propio />);

    expect(screen.getByText('Tu turno')).toBeOnTheScreen();
  });
});
