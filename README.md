# Turnero Laboratorio 2

Aplicacion movil de turnos para un centro medico, desarrollada con React Native, Expo y TypeScript.
Corresponde al proyecto ABP de Laboratorio II: cada unidad de la materia suma
funcionalidad sobre la misma app.

La agenda muestra los profesionales del centro con sus horarios del dia. Se puede
filtrar por especialidad, buscar por nombre, entrar al detalle de cada profesional,
reservar un turno y verlo o cancelarlo desde la pestaña Mis turnos. Cada turno tiene un
comprobante donde se adjunta la orden médica (cámara o galería), se firma con el dedo y se
comparte como imagen. En "El centro" se calcula a cuántos kilómetros estás de la sede. La pestaña "Mi ficha" guarda
los datos del paciente y de sus familiares en una base SQLite del dispositivo, y los turnos
reservados también quedan guardados.

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

## Tema

El diseño se centraliza en `src/theme/tema.ts` (colores, espacios, radios y tamaños de
fuente). `src/theme/ThemeProvider.tsx` es un `ThemeProvider` propio hecho con
`createContext`: envuelve la app en `app/_layout.tsx` y cualquier componente lee el tema
con el hook `useTheme()`. `Aviso`, `Seccion`, `Indicador` y `Estado` arman su
`StyleSheet` a partir del tema, y los layouts de navegacion toman de ahi los colores.

## Datos locales (SQLite y EAV)

La base `turnero.db` se crea sola la primera vez que se abre la app (`src/db/base.ts`) y tiene
dos tablas y una vista:

| Objeto | Para que sirve |
| --- | --- |
| `entity_attributes (id, entity_id, attribute, value)` | Modelo EAV: cada dato de la ficha es una fila. `entity_id` identifica a la persona y no es FK de ninguna tabla |
| `vw_pacientes` | Vista horizontal armada con `MAX(CASE WHEN ...)`: una fila por paciente con nombre, parentesco, obra social y afiliado |
| `reservas` | Turnos reservados. `paciente_id` guarda el `entity_id` de quien reservo |

Por que EAV para la ficha: cada paciente tiene datos distintos (alergias, grupo sanguineo, obra
social, medicacion, contacto de emergencia) y se pueden agregar campos nuevos desde la app sin
migrar la tabla.

- **Alta de un dato**: `INSERT ... ON CONFLICT (entity_id, attribute) DO UPDATE`, asi que
  guardar un campo que ya existe lo actualiza en vez de duplicarlo (el equivalente al `MERGE`
  del stored procedure de la clase).
- **Alta de un familiar**: el `entity_id` nuevo sale de `MAX(entity_id) + 1` dentro de una
  transaccion, para que dos altas no compartan el mismo id.
- **Lectura**: la lista de pacientes y el resumen del comprobante salen de la vista, y la tabla
  vertical campo/valor de la pantalla sale de `entity_attributes`.
- **Escritura**: `useMutation` de TanStack Query, que al terminar invalida las consultas de la
  ficha para que la pantalla se actualice sola.

Limitaciones del modelo EAV que se notan aca: `value` es siempre texto (no hay tipos), no se
puede declarar una FK desde `reservas.paciente_id` y las consultas son mas pesadas que sobre una
tabla comun. Para los datos fijos (las reservas) se usa una tabla relacional normal.

## Estructura

```
app/
  _layout.tsx             QueryClientProvider, ThemeProvider y stack raiz
  (tabs)/_layout.tsx      tabs con el badge de Mis turnos
  (tabs)/index.tsx        agenda del dia
  (tabs)/especialidades.tsx
  (tabs)/mis-turnos.tsx   turnos reservados
  (tabs)/ficha.tsx        ficha del paciente (EAV)
  (tabs)/info.tsx         datos del centro
  profesional/[id].tsx    detalle con ruta dinamica
  turno/[id].tsx          comprobante del turno
  camara.tsx              camara para la orden medica
src/
  api/                    cliente de axios y llamadas a la API
  db/                     SQLite: esquema, consultas y acceso a datos
  components/             componentes reutilizables
  data/                   datos fijos del centro
  hooks/                  hooks de TanStack Query, sensores y ubicacion
  store/                  store de Zustand (reservas guardadas en SQLite)
  theme/                  tema, ThemeProvider, colores y degradados
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
| `ReservaCard` | profesional, especialidad, consultorio, foto, hora, tieneOrden, onPress, onCancelar | Turno reservado en Mis turnos |
| `ComprobanteCard` | reserva, paciente, cardRef, sello, escalaSello, children | Comprobante con marco: es lo que se captura para compartir |
| `FirmaPad` | trazos, onCambiar | Zona de firma que dibuja con onTouchStart y onTouchMove |
| `DistanciaCentro` | centro | Tarjeta que busca tu ubicacion y calcula la distancia a la sede |
| `Boton` | titulo, onPress, icono, variante, deshabilitado | Boton del tema con variantes primario, secundario y peligro |
| `SelectorPacientes` | pacientes, seleccionado, onSeleccionar, onAgregar | Chips con el titular y los familiares |
| `FichaTabla` | atributos, onEditar, onBorrar | Tabla vertical campo/valor de la ficha |
| `FormularioAtributo` | campo, valor, editando, guardando, onCambiarCampo, onCambiarValor, onGuardar, onCancelar | Alta y edicion de un dato, con campos sugeridos |
| `FormularioPaciente` | guardando, onCrear, onCancelar | Alta de un familiar |
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
| II | Tema centralizado con un ThemeProvider propio y useTheme | Terminado |
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
| VI | Comprobante del turno en la ruta dinamica /turno/[id] | Terminado |
| VI | Orden medica con la camara (expo-camera) y permisos | Terminado |
| VI | Orden medica desde la galeria (expo-image-picker) | Terminado |
| VI | Compartir el comprobante como imagen (view-shot y expo-sharing) y como texto | Terminado |
| VI | Ubicacion, nombre del lugar y distancia al centro (expo-location) | Terminado |
| VI | Avisos si falta el permiso o el GPS esta apagado | Terminado |
| VI | Agitar el celular para actualizar la agenda (acelerometro) | Terminado |
| VI | El comprobante se inclina con el celular y cambia de sello al agitar | Terminado |
| VI | Animaciones con Animated: pop al reservar y salida al cancelar | Terminado |
| VI | Firma del paciente con eventos tactiles | Terminado |
| VI | Ficha del paciente con una tabla EAV en SQLite | Terminado |
| VI | Vista horizontal con MAX(CASE WHEN ...) para el resumen del paciente | Terminado |
| VI | CRUD de la ficha con mutaciones de TanStack Query | Terminado |
| VI | Familiares y turnos a nombre del paciente seleccionado | Terminado |
| VI | Reservas guardadas en el dispositivo y cargadas al abrir la app | Terminado |
| VI | Foto de la orden copiada al almacenamiento de la app (expo-file-system) | Terminado |
| Testing | Tests unitarios y de integracion con Jest | Pendiente |

La camara, la galeria, el GPS, el acelerometro y el compartir como imagen necesitan un celular
real con Expo Go. En la version web solo se ven los flujos de permisos, los sensores quedan
desactivados y la firma no dibuja porque el navegador no entrega las coordenadas del toque.
SQLite en web necesita encabezados de aislamiento (COOP y COEP) en el HTML que el servidor de
desarrollo de Expo no manda, por eso la ficha y las reservas guardadas se usan en el celular.
