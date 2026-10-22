import { useMemo, useRef } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Boton from '../../src/components/Boton';
import ComprobanteCard from '../../src/components/ComprobanteCard';
import Estado from '../../src/components/Estado';
import { useTurnosStore } from '../../src/store/turnos';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Tema } from '../../src/theme/tema';
import { avisar, pedirAjustes } from '../../src/utils/dialogos';

const crearEstilos = ({ colores, espacio }: Tema) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: colores.fondo },
    contenido: { padding: espacio.grande },
    grupo: { marginTop: espacio.medio },
    espacio: { height: espacio.chico },
    vacio: { flex: 1, justifyContent: 'center', backgroundColor: colores.fondo },
  });

const Comprobante = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);
  const tarjeta = useRef<View>(null);

  const reserva = useTurnosStore((state) => state.reservas.find((item) => item.id === id));
  const adjuntarOrden = useTurnosStore((state) => state.adjuntarOrden);

  if (!reserva) {
    return (
      <View style={estilos.vacio}>
        <Stack.Screen options={{ title: 'Comprobante' }} />
        <Estado tipo="vacio" mensaje="No encontramos ese turno. Puede que ya lo hayas cancelado." />
        <Boton titulo="Ir a Mis turnos" variante="secundario" onPress={() => router.back()} />
      </View>
    );
  }

  const elegirDeGaleria = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      pedirAjustes(
        'Sin acceso a las fotos',
        'Activá el permiso de fotos en Ajustes para elegir la orden médica.',
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!resultado.canceled) {
      adjuntarOrden(reserva.id, resultado.assets[0].uri);
    }
  };

  const compartirImagen = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        avisar('No se puede compartir acá', 'Probá desde el celular.');
        return;
      }

      const uri = await captureRef(tarjeta, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir comprobante' });
    } catch {
      avisar('No se pudo compartir el comprobante', 'Probá de nuevo.');
    }
  };

  const compartirTexto = async () => {
    await Share.share({
      message: `Turno confirmado\n${reserva.profesional} - ${reserva.especialidad}\nHoy a las ${reserva.hora} hs\n${reserva.consultorio}`,
    });
  };

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={[estilos.contenido, { paddingBottom: insets.bottom + 24 }]}
    >
      <Stack.Screen options={{ title: 'Comprobante' }} />

      <ComprobanteCard reserva={reserva} cardRef={tarjeta} />

      <View style={estilos.grupo}>
        <Boton
          titulo="Sacar foto de la orden"
          icono="camera"
          onPress={() => router.push({ pathname: '/camara', params: { reservaId: reserva.id } })}
          testID="boton-camara"
        />
        <View style={estilos.espacio} />
        <Boton
          titulo="Elegir de la galería"
          icono="images"
          variante="secundario"
          onPress={elegirDeGaleria}
          testID="boton-galeria"
        />
      </View>

      <View style={estilos.grupo}>
        <Boton
          titulo="Compartir comprobante (imagen)"
          icono="share-social"
          onPress={compartirImagen}
          testID="boton-compartir-imagen"
        />
        <View style={estilos.espacio} />
        <Boton
          titulo="Compartir solo el texto"
          icono="chatbubble-ellipses"
          variante="secundario"
          onPress={compartirTexto}
          testID="boton-compartir-texto"
        />
      </View>
    </ScrollView>
  );
};

export default Comprobante;
