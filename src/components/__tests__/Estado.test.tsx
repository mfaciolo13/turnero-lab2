import { fireEvent, render, screen } from '@testing-library/react-native';
import Estado from '../Estado';

describe('Estado', () => {
  it('muestra el mensaje que recibe', async () => {
    await render(<Estado tipo="vacio" mensaje="No hay profesionales." />);

    expect(screen.getByText('No hay profesionales.')).toBeOnTheScreen();
  });

  it('no ofrece reintentar si no hay qué reintentar', async () => {
    await render(<Estado tipo="error" mensaje="Falló la carga" />);

    expect(screen.queryByText('Reintentar')).toBeNull();
  });

  it('vuelve a intentar al tocar el botón', async () => {
    const onReintentar = jest.fn();
    await render(<Estado tipo="error" mensaje="Falló la carga" onReintentar={onReintentar} />);

    await fireEvent.press(screen.getByText('Reintentar'));

    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  it('muestra el indicador de carga mientras se espera', async () => {
    await render(<Estado tipo="cargando" mensaje="Buscando..." />);

    expect(screen.getByText('Buscando...')).toBeOnTheScreen();
    expect(screen.getByTestId('indicador-carga')).toBeOnTheScreen();
  });

  it('no muestra el indicador de carga cuando falló', async () => {
    await render(<Estado tipo="error" mensaje="Falló la carga" />);

    expect(screen.queryByTestId('indicador-carga')).toBeNull();
  });
});
