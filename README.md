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
App.tsx
src/
  components/     componentes reutilizables
  data/           datos estaticos del centro
  screens/        pantalla principal
  theme/          colores y sombras
  types.ts        tipos del dominio
```

## Componentes

| Componente | Props | Descripcion |
| --- | --- | --- |
| `Encabezado` | nombre, sede, fecha, logo | Cabecera con el logo y la fecha de la agenda |
| `ResumenDelDia` | indicadores | Tarjeta con los totales del dia |
| `Indicador` | valor, etiqueta, tono | Numero suelto dentro del resumen |
| `ListaEspecialidades` | especialidades, seleccionada | ScrollView horizontal de especialidades |
| `ChipEspecialidad` | nombre, disponibles, destacado | Chip con el cupo de una especialidad |
| `ProfesionalCard` | nombre, especialidad, consultorio, foto, valoracion, cobertura, horarios | Tarjeta del profesional con foto y turnos |
| `HorarioChip` | hora, ocupado | Horario libre u ocupado |
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
| III | Navegacion con Expo Router: Tabs y Stack | Pendiente |
| III | Detalle del profesional con ruta dinamica y parametros | Pendiente |
| IV | Listados con FlatList y SectionList | Pendiente |
| IV | Buscador con TextInput e iconos vectoriales | Pendiente |
| IV | Paginacion con scroll infinito | Pendiente |
| V | Consumo de API con Axios y TanStack Query | Pendiente |
| V | Turnos reservados en un store de Zustand | Pendiente |
| VI | Persistencia local de los turnos reservados | Pendiente |

Las features pendientes dependen de contenidos que se ven en las proximas unidades,
por lo que se van a incorporar en las siguientes entregas.
