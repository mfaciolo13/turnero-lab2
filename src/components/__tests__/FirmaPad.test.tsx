import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Trazo } from '../../utils/firma';
import FirmaPad from '../FirmaPad';

const Pad = ({ inicial = [] }: { inicial?: Trazo[] }) => {
  const [trazos, setTrazos] = useState<Trazo[]>(inicial);
  return <FirmaPad trazos={trazos} onCambiar={setTrazos} />;
};

const tocar = (x: number, y: number) => ({ nativeEvent: { locationX: x, locationY: y } });

const segmentos = () => screen.queryAllByTestId('segmento-firma');

describe('FirmaPad', () => {
  it('invita a firmar mientras está vacío', async () => {
    await render(<Pad />);

    expect(screen.getByText('Firmá acá con el dedo')).toBeOnTheScreen();
    expect(segmentos()).toHaveLength(0);
  });

  it('dibuja un punto al apoyar el dedo', async () => {
    await render(<Pad />);

    await fireEvent(screen.getByTestId('firma-pad'), 'touchStart', tocar(10, 20));

    expect(segmentos()).toHaveLength(1);
  });

  it('deja de mostrar la invitación apenas se empieza a firmar', async () => {
    await render(<Pad />);

    await fireEvent(screen.getByTestId('firma-pad'), 'touchStart', tocar(10, 20));

    expect(screen.queryByText('Firmá acá con el dedo')).toBeNull();
  });

  it('une los puntos con segmentos al mover el dedo', async () => {
    await render(<Pad />);
    const pad = screen.getByTestId('firma-pad');

    await fireEvent(pad, 'touchStart', tocar(10, 20));
    await fireEvent(pad, 'touchMove', tocar(40, 20));
    expect(segmentos()).toHaveLength(1);

    await fireEvent(pad, 'touchMove', tocar(70, 50));
    expect(segmentos()).toHaveLength(2);
  });

  it('empieza un trazo nuevo cada vez que se vuelve a apoyar el dedo', async () => {
    await render(<Pad />);
    const pad = screen.getByTestId('firma-pad');

    await fireEvent(pad, 'touchStart', tocar(10, 20));
    await fireEvent(pad, 'touchMove', tocar(40, 20));
    await fireEvent(pad, 'touchStart', tocar(10, 80));
    await fireEvent(pad, 'touchMove', tocar(40, 80));

    expect(segmentos()).toHaveLength(2);
  });

  it('ignora el movimiento si todavía no se apoyó el dedo', async () => {
    await render(<Pad />);

    await fireEvent(screen.getByTestId('firma-pad'), 'touchMove', tocar(40, 20));

    expect(segmentos()).toHaveLength(0);
  });

  it('ignora los toques que no traen coordenadas', async () => {
    await render(<Pad />);

    await fireEvent(screen.getByTestId('firma-pad'), 'touchStart', { nativeEvent: {} });

    expect(segmentos()).toHaveLength(0);
  });

  it('muestra una firma que ya estaba hecha', async () => {
    await render(
      <Pad
        inicial={[
          [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
            { x: 20, y: 0 },
          ],
        ]}
      />,
    );

    expect(segmentos()).toHaveLength(2);
  });
});
