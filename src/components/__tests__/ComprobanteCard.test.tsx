import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Paciente, Reserva } from '../../types';
import ComprobanteCard from '../ComprobanteCard';

const reserva: Reserva = {
  id: '1-09:20',
  pacienteId: 2,
  profesionalId: 1,
  profesional: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2 - Primer piso',
  foto: 'https://dummyjson.com/icon/emilys/128',
  hora: '09:20',
  orden: null,
};

const paciente: Paciente = {
  id: 2,
  nombre: 'Lucia',
  parentesco: 'Hija',
  obraSocial: 'OSDE',
  afiliado: '123456',
};

describe('ComprobanteCard', () => {
  it('muestra el profesional, la hora y el consultorio', async () => {
    await render(<ComprobanteCard reserva={reserva} />);

    expect(screen.getByText('Dra. Emily Johnson')).toBeOnTheScreen();
    expect(screen.getByText('Hoy a las 09:20 hs')).toBeOnTheScreen();
    expect(screen.getByText('Consultorio 2 - Primer piso')).toBeOnTheScreen();
  });

  it('avisa que no hay orden médica adjunta', async () => {
    await render(<ComprobanteCard reserva={reserva} />);

    expect(screen.getByText('Sin orden adjunta')).toBeOnTheScreen();
    expect(screen.queryByTestId('imagen-orden')).toBeNull();
  });

  it('muestra la imagen de la orden cuando está adjunta', async () => {
    await render(<ComprobanteCard reserva={{ ...reserva, orden: 'file:///orden.jpg' }} />);

    expect(screen.getByTestId('imagen-orden')).toBeOnTheScreen();
    expect(screen.queryByText('Sin orden adjunta')).toBeNull();
  });

  it('muestra el paciente con su parentesco y su cobertura', async () => {
    await render(<ComprobanteCard reserva={reserva} paciente={paciente} />);

    expect(screen.getByTestId('paciente')).toHaveTextContent('Lucia (Hija)');
    expect(screen.getByTestId('obra-social')).toHaveTextContent('OSDE · Afiliado 123456');
  });

  it('no muestra la cobertura si el paciente no tiene obra social', async () => {
    await render(
      <ComprobanteCard
        reserva={reserva}
        paciente={{ ...paciente, obraSocial: null, afiliado: null }}
      />,
    );

    expect(screen.getByTestId('paciente')).toBeOnTheScreen();
    expect(screen.queryByTestId('obra-social')).toBeNull();
  });

  it('muestra la obra social sin número de afiliado si no se cargó', async () => {
    await render(<ComprobanteCard reserva={reserva} paciente={{ ...paciente, afiliado: null }} />);

    expect(screen.getByTestId('obra-social')).toHaveTextContent('OSDE');
    expect(screen.getByTestId('obra-social')).not.toHaveTextContent(/Afiliado/);
  });

  it('omite la sección del paciente si todavía no se conoce', async () => {
    await render(<ComprobanteCard reserva={reserva} />);

    expect(screen.queryByTestId('paciente')).toBeNull();
  });

  it('muestra el sello cuando se le indica uno', async () => {
    await render(<ComprobanteCard reserva={reserva} sello="🩺" />);

    expect(screen.getByTestId('sello')).toHaveTextContent('🩺');
  });

  it('agrega el título de la firma solo si recibe una firma', async () => {
    await render(
      <ComprobanteCard reserva={reserva}>
        <Text>zona de firma</Text>
      </ComprobanteCard>,
    );

    expect(screen.getByText('Firma del paciente')).toBeOnTheScreen();
    expect(screen.getByText('zona de firma')).toBeOnTheScreen();
  });

  it('no muestra el título de la firma si no hay firma', async () => {
    await render(<ComprobanteCard reserva={reserva} />);

    expect(screen.queryByText('Firma del paciente')).toBeNull();
  });
});
