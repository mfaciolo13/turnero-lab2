import { cliente } from './cliente';
import { coberturas, especialidades, horariosDelCentro } from '../data/centro';
import { Horario, Profesional, ResumenEspecialidad } from '../types';

type UsuarioApi = {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  phone: string;
};

type RespuestaUsuarios<T> = {
  users: T[];
  total: number;
  skip: number;
  limit: number;
};

export type PaginaProfesionales = {
  profesionales: Profesional[];
  siguiente?: number;
};

const POR_PAGINA = 10;
const CAMPOS = 'firstName,lastName,gender,image,phone';

const especialidadDe = (id: number) => especialidades[id % especialidades.length];

const generarHorarios = (id: number): Horario[] =>
  horariosDelCentro
    .filter((_, indice) => (id + indice) % 3 !== 0)
    .map((hora, indice) => ({ hora, ocupado: (id * 7 + indice * 3) % 5 < 2 }));

const tituloDe = (usuario: UsuarioApi, especialidad: string) => {
  if (especialidad === 'Kinesiologia') {
    return 'Lic.';
  }
  return usuario.gender === 'female' ? 'Dra.' : 'Dr.';
};

const aProfesional = (usuario: UsuarioApi): Profesional => {
  const especialidad = especialidadDe(usuario.id).nombre;

  return {
    id: usuario.id,
    nombre: `${tituloDe(usuario, especialidad)} ${usuario.firstName} ${usuario.lastName}`,
    especialidad,
    consultorio: `Consultorio ${(usuario.id % 12) + 1} - ${usuario.id % 2 === 0 ? 'Planta baja' : 'Primer piso'}`,
    foto: usuario.image,
    valoracion: Number((4 + (usuario.id % 10) / 10).toFixed(1)),
    cobertura: coberturas[usuario.id % coberturas.length],
    telefono: usuario.phone,
    horarios: generarHorarios(usuario.id),
  };
};

export const obtenerProfesionales = async (
  pagina: number,
  busqueda: string,
): Promise<PaginaProfesionales> => {
  const ruta = busqueda ? '/users/search' : '/users';

  const { data } = await cliente.get<RespuestaUsuarios<UsuarioApi>>(ruta, {
    params: {
      q: busqueda || undefined,
      limit: POR_PAGINA,
      skip: pagina * POR_PAGINA,
      select: CAMPOS,
    },
  });

  const cargados = data.skip + data.users.length;

  return {
    profesionales: data.users.map(aProfesional),
    siguiente: cargados < data.total ? pagina + 1 : undefined,
  };
};

export const obtenerProfesional = async (id: number): Promise<Profesional> => {
  const { data } = await cliente.get<UsuarioApi>(`/users/${id}`, {
    params: { select: CAMPOS },
  });

  return aProfesional(data);
};

export const obtenerResumenEspecialidades = async (): Promise<ResumenEspecialidad[]> => {
  const { data } = await cliente.get<RespuestaUsuarios<{ id: number }>>('/users', {
    params: { limit: 0, select: 'id' },
  });

  return especialidades.map((especialidad) => {
    const ids = data.users
      .map((usuario) => usuario.id)
      .filter((id) => especialidadDe(id).id === especialidad.id);

    const horarios = ids.flatMap(generarHorarios);
    const disponibles = horarios.filter((horario) => !horario.ocupado).length;

    return {
      ...especialidad,
      profesionales: ids.length,
      disponibles,
      ocupados: horarios.length - disponibles,
    };
  });
};
