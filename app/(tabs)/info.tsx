import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Aviso from '../../src/components/Aviso';
import DistanciaCentro from '../../src/components/DistanciaCentro';
import ResumenDelDia from '../../src/components/ResumenDelDia';
import { useIndicadores } from '../../src/hooks/useIndicadores';
import { centro } from '../../src/data/centro';
import { colores, sombra } from '../../src/theme/colores';

const mapa = 'https://maps.google.com/?q=Av.+Colon+1240+Cordoba';
const telefono = 'tel:+543514567890';

const Info = () => {
  const indicadores = useIndicadores();

  return (
    <SafeAreaView style={estilos.pantalla} edges={['bottom']}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.tarjeta}>
          <Text style={estilos.nombre}>{centro.nombre}</Text>
          <Text style={estilos.sede}>{centro.sede}</Text>
          <Text style={estilos.horario}>
            Lunes a viernes de 08:00 a 20:00 · Sábados de 09:00 a 13:00
          </Text>

          <View style={estilos.acciones}>
            <TouchableOpacity
              style={estilos.boton}
              onPress={() => Linking.openURL(mapa)}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={16} color={colores.superficie} />
              <Text style={estilos.botonTexto}>Cómo llegar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[estilos.boton, estilos.botonSecundario]}
              onPress={() => Linking.openURL(telefono)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={16} color={colores.primarioOscuro} />
              <Text style={[estilos.botonTexto, estilos.botonTextoSecundario]}>Llamar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <DistanciaCentro centro={centro.coordenadas} />

        <ResumenDelDia indicadores={indicadores} />

        <Aviso
          titulo="Cancelaciones"
          mensaje="Podés cancelar hasta 2 horas antes del turno sin costo. Pasado ese plazo el turno se considera ausente."
        />

        <Link href="/especialidades" style={estilos.link}>
          Ver todas las especialidades
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    paddingVertical: 18,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    marginHorizontal: 20,
    marginBottom: 26,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombra,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
  },
  sede: {
    fontSize: 13,
    color: colores.textoSuave,
    marginTop: 4,
  },
  horario: {
    fontSize: 13,
    color: colores.texto,
    marginTop: 12,
    lineHeight: 19,
  },
  acciones: {
    flexDirection: 'row',
    marginTop: 16,
  },
  boton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colores.primario,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  botonSecundario: {
    backgroundColor: colores.primarioSuave,
    marginRight: 0,
  },
  botonTexto: {
    marginLeft: 8,
    color: colores.superficie,
    fontWeight: '700',
    fontSize: 14,
  },
  botonTextoSecundario: {
    color: colores.primarioOscuro,
  },
  link: {
    marginTop: 8,
    marginHorizontal: 20,
    fontSize: 14,
    fontWeight: '600',
    color: colores.primario,
  },
});

export default Info;
