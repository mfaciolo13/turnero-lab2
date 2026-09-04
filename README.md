# Turnero San Rafael

Aplicacion movil de turnos para un centro medico, desarrollada con React Native, Expo y TypeScript.
Corresponde a la Unidad I del proyecto ABP de Laboratorio II.

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

| Feature | Estado |
| --- | --- |
| Pantalla principal con la agenda del dia | Terminado |
| Componentes reutilizables comunicados por props | Terminado |
| Datos estaticos del centro y los profesionales | Terminado |
| Listado scrolleable de profesionales | Terminado |
| Scroll horizontal de especialidades | Terminado |
| Filtrar profesionales al tocar una especialidad | Pendiente |
| Pantalla de detalle del profesional | Pendiente |
| Reservar y cancelar un turno | Pendiente |
| Navegacion entre pantallas | Pendiente |
| Consumo de API para traer los turnos | Pendiente |
| Persistencia de los turnos reservados | Pendiente |

Las features pendientes dependen de contenidos que se ven en las proximas unidades
(estado, navegacion, consumo de datos), por lo que se van a incorporar en las
siguientes entregas.
