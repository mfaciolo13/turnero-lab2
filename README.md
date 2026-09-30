# Turnero San Rafael

Aplicacion movil de turnos para un centro medico, desarrollada con React Native, Expo y TypeScript.
Corresponde al proyecto ABP de Laboratorio II: cada unidad de la materia suma
funcionalidad sobre la misma app.

La pantalla principal muestra la agenda del dia: el resumen de turnos del centro, las
especialidades con cupos disponibles y el listado de profesionales con sus horarios
libres y ocupados.

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

## Estructura

```
app/
  _layout.tsx             stack raiz y tema de los headers
  (tabs)/_layout.tsx      navegacion por tabs
  (tabs)/index.tsx        agenda del dia
  (tabs)/especialidades.tsx
  (tabs)/info.tsx         datos del centro
  profesional/[id].tsx    detalle con ruta dinamica
src/
  components/             componentes reutilizables
  data/                   datos estaticos del centro
  theme/                  colores, degradados y sombras
  utils/                  agrupado de horarios por franja
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
| `HorarioFila` | hora, ocupado, onPress | Fila de horario con boton de reserva |
| `Buscador` | valor, onCambiar, placeholder | TextInput con icono y boton para limpiar |
| `Seccion` | titulo, detalle, children | Titulo de seccion reutilizable |
| `Aviso` | titulo, mensaje | Recordatorio para el paciente |

## Features

| Unidad | Feature | Estado |
| --- | --- | --- |
| I | Pantalla principal con la agenda del dia | Terminado |
| I | Componentes reutilizables comunicados por props | Terminado |
| I | Datos estaticos del centro y los profesionales | Terminado |
| I | ScrollView vertical y horizontal | Terminado |
| II | Gradiente en el encabezado con expo-linear-gradient | Terminado |
| II | Tarjetas y chips tactiles con TouchableOpacity | Terminado |
| II | Horarios con TouchableHighlight y estado ocupado | Terminado |
| II | Filtrar profesionales tocando una especialidad | Terminado |
| III | Ir de una especialidad a la agenda filtrada por parametro | Terminado |
| III | Abrir el mapa y el telefono del centro con Linking | Terminado |
| III | Navegacion con Expo Router: Tabs y Stack | Terminado |
| III | Detalle del profesional con ruta dinamica y parametros | Terminado |
| IV | Agenda y especialidades con FlatList | Terminado |
| IV | Horarios del profesional agrupados por franja con SectionList | Terminado |
| IV | Buscador con TextInput por nombre o especialidad | Terminado |
| IV | Iconos con @expo/vector-icons en tabs, tarjetas y botones | Terminado |
| IV | SafeAreaView y margenes seguros en todas las pantallas | Terminado |
| IV | Paginacion con scroll infinito | Pendiente |
| V | Consumo de API con Axios y TanStack Query | Pendiente |
| V | Turnos reservados en un store de Zustand | Pendiente |
| VI | Persistencia local de los turnos reservados | Pendiente |

Las features pendientes dependen de contenidos que se ven en las proximas unidades,
por lo que se van a incorporar en las siguientes entregas.
