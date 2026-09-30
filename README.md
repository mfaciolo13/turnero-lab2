# Turnero San Rafael

Aplicacion movil de turnos para un centro medico, desarrollada con React Native, Expo y TypeScript.
Corresponde al proyecto ABP de Laboratorio II: cada unidad de la materia suma
funcionalidad sobre la misma app.

La agenda muestra los profesionales del centro con sus horarios del dia. Se puede
filtrar por especialidad, buscar por nombre, entrar al detalle de cada profesional,
reservar un turno y verlo o cancelarlo desde la pestaña Mis turnos.

## Integrantes

- Faciolo Mayco
- Ferreyra Amiel

## Como correr el proyecto

Requiere Node.js 22 y la app Expo Go en el celular.

```bash
npm install
npm start
```

Luego escanear el codigo QR con Expo Go, o correr `npm run android` / `npm run web`.

Para revisar los tipos:

```bash
npx tsc --noEmit
```

## Datos

Los profesionales salen de la API publica [DummyJSON](https://dummyjson.com/docs/users).
Cada usuario se transforma en un profesional en `src/api/profesionales.ts`: el nombre,
la foto y el telefono vienen de la API, y la especialidad, el consultorio, la cobertura
y los horarios se calculan a partir del id para que siempre den lo mismo.

| Hook | Que hace |
| --- | --- |
| `useProfesionales` | `useInfiniteQuery` paginado de a 10, con busqueda por nombre |
| `useProfesional` | `useQuery` del detalle de un profesional |
| `useResumenEspecialidades` | `useQuery` con los cupos por especialidad. La agenda, especialidades y el centro comparten la misma `queryKey`, asi que se pide una sola vez |
| `useIndicadores` | Combina el resumen de la API con las reservas del store |
| `useTurnosStore` | Store de Zustand con las reservas y las acciones `reservar` y `cancelar` |

## Estructura

```
app/
  _layout.tsx             QueryClientProvider y stack raiz
  (tabs)/_layout.tsx      tabs con el badge de Mis turnos
  (tabs)/index.tsx        agenda del dia
  (tabs)/especialidades.tsx
  (tabs)/mis-turnos.tsx   turnos reservados
  (tabs)/info.tsx         datos del centro
  profesional/[id].tsx    detalle con ruta dinamica
src/
  api/                    cliente de axios y llamadas a la API
  components/             componentes reutilizables
  data/                   datos fijos del centro
  hooks/                  hooks de TanStack Query y auxiliares
  store/                  store de Zustand
  theme/                  colores, degradados y sombras
  utils/                  agrupado por franja y dialogos
  types.ts                tipos del dominio
```

## Componentes

| Componente | Props | Descripcion |
| --- | --- | --- |
| `Encabezado` | nombre, sede, fecha, logo | Cabecera con degradado, logo y fecha |
| `ResumenDelDia` | indicadores, superpuesto | Tarjeta con los totales del dia |
| `Indicador` | valor, etiqueta, tono | Numero suelto dentro del resumen |
| `ListaEspecialidades` | especialidades, seleccionada, onSeleccionar | ScrollView horizontal de especialidades |
| `ChipEspecialidad` | nombre, disponibles, destacado, onPress | Chip tactil con el cupo de una especialidad |
| `EspecialidadItem` | nombre, profesionales, disponibles, onPress | Fila de la pantalla de especialidades |
| `ProfesionalCard` | nombre, especialidad, consultorio, foto, valoracion, cobertura, horarios, onPress, onElegirHorario | Tarjeta del profesional con foto y turnos |
| `HorarioChip` | hora, ocupado, onPress | Horario libre u ocupado dentro de la tarjeta |
| `HorarioFila` | hora, ocupado, propio, onReservar, onCancelar | Fila de horario para reservar o cancelar |
| `ReservaCard` | profesional, especialidad, consultorio, foto, hora, onPress, onCancelar | Turno reservado en Mis turnos |
| `Buscador` | valor, onCambiar, placeholder | TextInput con icono y boton para limpiar |
| `Estado` | tipo, mensaje, onReintentar | Carga, error o lista vacia |
| `Seccion` | titulo, detalle, children | Titulo de seccion reutilizable |
| `Aviso` | titulo, mensaje | Recordatorio para el paciente |

## Features

| Unidad | Feature | Estado |
| --- | --- | --- |
| I | Pantalla principal con la agenda del dia | Terminado |
| I | Componentes reutilizables comunicados por props | Terminado |
| I | ScrollView vertical y horizontal | Terminado |
| II | Gradiente en el encabezado con expo-linear-gradient | Terminado |
| II | Tarjetas y chips tactiles con TouchableOpacity | Terminado |
| II | Horarios con TouchableHighlight y estado ocupado | Terminado |
| II | Filtrar profesionales tocando una especialidad | Terminado |
| III | Navegacion con Expo Router: Tabs y Stack | Terminado |
| III | Detalle del profesional con ruta dinamica y parametros | Terminado |
| III | Ir de una especialidad a la agenda filtrada por parametro | Terminado |
| III | Abrir el mapa y el telefono con Linking | Terminado |
| IV | Agenda y especialidades con FlatList | Terminado |
| IV | Horarios y reservas agrupados por franja con SectionList | Terminado |
| IV | Buscador con TextInput | Terminado |
| IV | Iconos con @expo/vector-icons en tabs, tarjetas y botones | Terminado |
| IV | SafeAreaView y margenes seguros en todas las pantallas | Terminado |
| IV | Paginacion con scroll infinito | Terminado |
| V | Consumo de la API de DummyJSON con Axios | Terminado |
| V | TanStack Query con cache, estados de carga, error y reintento | Terminado |
| V | Pull to refresh para revalidar los datos | Terminado |
| V | Reservar y cancelar turnos con un store de Zustand | Terminado |
| V | Badge e indicadores que leen el store sin pasar props | Terminado |
| VI | Persistencia local de los turnos reservados | Pendiente |
| VI | Animaciones al reservar y cancelar | Pendiente |

Las reservas viven en memoria mientras la app esta abierta. Guardarlas en el
dispositivo depende de AsyncStorage y SQLite, que se ven en la Unidad VI.
