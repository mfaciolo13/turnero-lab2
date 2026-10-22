import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Profesional } from '../../types';
import Aviso from '../Aviso';
import ChipEspecialidad from '../ChipEspecialidad';
import EspecialidadItem from '../EspecialidadItem';
import Indicador from '../Indicador';
import ListaEspecialidades from '../ListaEspecialidades';
import ProfesionalCard from '../ProfesionalCard';
import ResumenDelDia from '../ResumenDelDia';
import Seccion from '../Seccion';

const profesional: Omit<Profesional, 'id' | 'telefono'> = {
  nombre: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2 - Primer piso',
  foto: 'https://dummyjson.com/icon/emilys/128',
  valoracion: 4.1,
  cobertura: 'PAMI - Particular',
  horarios: [
    { hora: '08:00', ocupado: false },
    { hora: '08:40', ocupado: true },
    { hora: '09:20', ocupado: false },
  ],
};

describe('ProfesionalCard', () => {
  const acciones = { onPress: jest.fn(), onElegirHorario: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra los datos del profesional', async () => {
    await render(<ProfesionalCard {...profesional} {...acciones} />);

    expect(screen.getByText('Dra. Emily Johnson')).toBeOnTheScreen();
    expect(screen.getByText('Pediatria')).toBeOnTheScreen();
    expect(screen.getByText('Consultorio 2 - Primer piso')).toBeOnTheScreen();
    expect(screen.getByText('4.1')).toBeOnTheScreen();
    expect(screen.getByText('PAMI - Particular')).toBeOnTheScreen();
  });

  it('cuenta solo los horarios libres', async () => {
    await render(<ProfesionalCard {...profesional} {...acciones} />);

    expect(screen.getByText('2 disponibles')).toBeOnTheScreen();
  });

  it('abre el detalle al tocar los datos del profesional', async () => {
    await render(<ProfesionalCard {...profesional} {...acciones} />);

    await fireEvent.press(screen.getByText('Dra. Emily Johnson'));

    expect(acciones.onPress).toHaveBeenCalledTimes(1);
  });

  it('avisa qué horario se tocó', async () => {
    await render(<ProfesionalCard {...profesional} {...acciones} />);

    await fireEvent.press(screen.getByText('09:20'));

    expect(acciones.onElegirHorario).toHaveBeenCalledWith('09:20');
  });

  it('no deja elegir un horario ocupado', async () => {
    await render(<ProfesionalCard {...profesional} {...acciones} />);

    await fireEvent.press(screen.getByText('08:40'));

    expect(acciones.onElegirHorario).not.toHaveBeenCalled();
  });
});

describe('ChipEspecialidad y ListaEspecialidades', () => {
  it('muestra la cantidad de turnos cuando se conoce', async () => {
    await render(
      <ChipEspecialidad nombre="Pediatria" disponibles={7} destacado={false} onPress={jest.fn()} />,
    );

    expect(screen.getByText('7')).toBeOnTheScreen();
  });

  it('no muestra la cantidad cuando todavía no se conoce', async () => {
    await render(<ChipEspecialidad nombre="Pediatria" destacado={false} onPress={jest.fn()} />);

    expect(screen.getByText('Pediatria')).toBeOnTheScreen();
    expect(screen.queryByText('7')).toBeNull();
  });

  it('avisa al tocar la especialidad', async () => {
    const onPress = jest.fn();
    await render(<ChipEspecialidad nombre="Pediatria" destacado={false} onPress={onPress} />);

    await fireEvent.press(screen.getByTestId('especialidad-Pediatria'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('lista todas las especialidades y avisa cuál se eligió', async () => {
    const onSeleccionar = jest.fn();
    await render(
      <ListaEspecialidades
        especialidades={[
          { id: 'pediatria', nombre: 'Pediatria', disponibles: 4 },
          { id: 'cardiologia', nombre: 'Cardiologia' },
        ]}
        seleccionada="pediatria"
        onSeleccionar={onSeleccionar}
      />,
    );

    await fireEvent.press(screen.getByTestId('especialidad-Cardiologia'));

    expect(screen.getByText('Pediatria')).toBeOnTheScreen();
    expect(onSeleccionar).toHaveBeenCalledWith('cardiologia');
  });
});

describe('EspecialidadItem', () => {
  const props = { nombre: 'Pediatria', disponibles: 10, onPress: jest.fn() };

  it('habla en plural con más de un profesional', async () => {
    await render(<EspecialidadItem {...props} profesionales={2} />);

    expect(screen.getByText('2 profesionales · 10 turnos libres')).toBeOnTheScreen();
  });

  it('habla en singular con un solo profesional', async () => {
    await render(<EspecialidadItem {...props} profesionales={1} />);

    expect(screen.getByText('1 profesional · 10 turnos libres')).toBeOnTheScreen();
  });

  it('muestra la inicial de la especialidad y avisa al tocarla', async () => {
    await render(<EspecialidadItem {...props} profesionales={1} />);

    await fireEvent.press(screen.getByText('Pediatria'));

    expect(screen.getByText('P')).toBeOnTheScreen();
    expect(props.onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Indicador y ResumenDelDia', () => {
  it('muestra el valor con su etiqueta', async () => {
    await render(<Indicador valor="18" etiqueta="Turnos libres" tono="exito" />);

    expect(screen.getByText('18')).toBeOnTheScreen();
    expect(screen.getByText('Turnos libres')).toBeOnTheScreen();
  });

  it('muestra un indicador por cada métrica', async () => {
    await render(
      <ResumenDelDia
        indicadores={[
          { id: 'a', valor: '5', etiqueta: 'Libres', tono: 'exito' },
          { id: 'b', valor: '2', etiqueta: 'Reservados', tono: 'ocupado' },
          { id: 'c', valor: '1', etiqueta: 'Mis turnos', tono: 'primario' },
        ]}
      />,
    );

    expect(screen.getByText('Libres')).toBeOnTheScreen();
    expect(screen.getByText('Reservados')).toBeOnTheScreen();
    expect(screen.getByText('Mis turnos')).toBeOnTheScreen();
  });
});

describe('Seccion y Aviso', () => {
  it('muestra el título, el detalle y el contenido de la sección', async () => {
    await render(
      <Seccion titulo="Profesionales" detalle="3 cargados">
        <Text>contenido</Text>
      </Seccion>,
    );

    expect(screen.getByText('Profesionales')).toBeOnTheScreen();
    expect(screen.getByText('3 cargados')).toBeOnTheScreen();
    expect(screen.getByText('contenido')).toBeOnTheScreen();
  });

  it('omite el detalle cuando no se indica', async () => {
    await render(
      <Seccion titulo="Profesionales">
        <Text>contenido</Text>
      </Seccion>,
    );

    expect(screen.queryByText('3 cargados')).toBeNull();
  });

  it('muestra el título y el mensaje del aviso', async () => {
    await render(<Aviso titulo="Antes de venir" mensaje="Traé tu DNI." />);

    expect(screen.getByText('Antes de venir')).toBeOnTheScreen();
    expect(screen.getByText('Traé tu DNI.')).toBeOnTheScreen();
  });
});
