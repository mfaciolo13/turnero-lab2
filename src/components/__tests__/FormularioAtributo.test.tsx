import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import FormularioAtributo from '../FormularioAtributo';

type Opciones = {
  campo?: string;
  valor?: string;
  editando?: boolean;
  guardando?: boolean;
};

const acciones = {
  onCambiarCampo: jest.fn(),
  onCambiarValor: jest.fn(),
  onGuardar: jest.fn(),
  onCancelar: jest.fn(),
};

const formulario = ({ campo = '', valor = '', editando = false, guardando = false }: Opciones) => (
  <FormularioAtributo
    campo={campo}
    valor={valor}
    editando={editando}
    guardando={guardando}
    {...acciones}
  />
);

const Conectado = () => {
  const [campo, setCampo] = useState('');
  const [valor, setValor] = useState('');

  return (
    <FormularioAtributo
      campo={campo}
      valor={valor}
      editando={false}
      guardando={false}
      onCambiarCampo={setCampo}
      onCambiarValor={setValor}
      onGuardar={acciones.onGuardar}
      onCancelar={acciones.onCancelar}
    />
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FormularioAtributo para agregar', () => {
  it('ofrece los campos más comunes como sugerencias', async () => {
    await render(formulario({}));

    expect(screen.getByText('Obra social')).toBeOnTheScreen();
    expect(screen.getByText('Grupo sanguineo')).toBeOnTheScreen();
    expect(screen.getByText('Alergias')).toBeOnTheScreen();
  });

  it('completa el campo al tocar una sugerencia', async () => {
    await render(formulario({}));

    await fireEvent.press(screen.getByTestId('sugerencia-obra_social'));

    expect(acciones.onCambiarCampo).toHaveBeenCalledWith('Obra social');
  });

  it('empieza con el botón de guardar deshabilitado', async () => {
    await render(formulario({}));

    expect(screen.getByTestId('boton-guardar-campo')).toBeDisabled();
  });

  it('sigue deshabilitado si falta el valor', async () => {
    await render(formulario({ campo: 'Alergias' }));

    expect(screen.getByTestId('boton-guardar-campo')).toBeDisabled();
  });

  it('sigue deshabilitado si el valor son solo espacios', async () => {
    await render(formulario({ campo: 'Alergias', valor: '   ' }));

    expect(screen.getByTestId('boton-guardar-campo')).toBeDisabled();
  });

  it('sigue deshabilitado si el campo no tiene letras ni números', async () => {
    await render(formulario({ campo: '???', valor: 'algo' }));

    expect(screen.getByTestId('boton-guardar-campo')).toBeDisabled();
  });

  it('se habilita cuando están el campo y el valor', async () => {
    await render(formulario({ campo: 'Alergias', valor: 'Penicilina' }));

    expect(screen.getByTestId('boton-guardar-campo')).toBeEnabled();
  });

  it('guarda al tocar el botón', async () => {
    await render(formulario({ campo: 'Alergias', valor: 'Penicilina' }));

    await fireEvent.press(screen.getByTestId('boton-guardar-campo'));

    expect(acciones.onGuardar).toHaveBeenCalledTimes(1);
  });

  it('se deshabilita mientras se está guardando', async () => {
    await render(formulario({ campo: 'Alergias', valor: 'Penicilina', guardando: true }));

    expect(screen.getByTestId('boton-guardar-campo')).toBeDisabled();
  });

  it('se habilita recién cuando el usuario termina de escribir', async () => {
    await render(<Conectado />);

    await fireEvent.changeText(screen.getByTestId('input-campo'), 'Medicación');
    expect(screen.getByTestId('boton-guardar-campo')).toBeDisabled();

    await fireEvent.changeText(screen.getByTestId('input-valor'), 'Ibuprofeno');
    expect(screen.getByTestId('boton-guardar-campo')).toBeEnabled();
  });
});

describe('FormularioAtributo para editar', () => {
  it('cambia el título y el botón', async () => {
    await render(formulario({ campo: 'Alergias', valor: 'Ninguna', editando: true }));

    expect(screen.getByText('Editar dato')).toBeOnTheScreen();
    expect(screen.getByText('Guardar cambios')).toBeOnTheScreen();
  });

  it('esconde las sugerencias', async () => {
    await render(formulario({ campo: 'Alergias', valor: 'Ninguna', editando: true }));

    expect(screen.queryByTestId('sugerencia-obra_social')).toBeNull();
  });

  it('no deja cambiar el nombre del campo', async () => {
    await render(formulario({ campo: 'Alergias', valor: 'Ninguna', editando: true }));

    expect(screen.getByTestId('input-campo')).toHaveProp('editable', false);
  });

  it('permite cancelar la edición', async () => {
    await render(formulario({ campo: 'Alergias', valor: 'Ninguna', editando: true }));

    await fireEvent.press(screen.getByTestId('boton-cancelar-edicion'));

    expect(acciones.onCancelar).toHaveBeenCalledTimes(1);
  });

  it('no ofrece cancelar cuando se está agregando', async () => {
    await render(formulario({}));

    expect(screen.queryByTestId('boton-cancelar-edicion')).toBeNull();
  });
});
