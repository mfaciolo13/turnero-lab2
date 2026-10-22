import { useMemo, useRef, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { Animated, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Boton from '../../src/components/Boton';
import ComprobanteCard from '../../src/components/ComprobanteCard';
import Estado from '../../src/components/Estado';
import FirmaPad from '../../src/components/FirmaPad';
import { elegirSelloDistinto, sellos } from '../../src/data/sellos';
import { usePaciente } from '../../src/hooks/useFicha';
import { useAcelerometro } from '../../src/hooks/useAcelerometro';
import { useTurnosStore } from '../../src/store/turnos';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Tema } from '../../src/theme/tema';
import { conservarImagen } from '../../src/utils/archivos';
import { avisar, pedirAjustes } from '../../src/utils/dialogos';
import { textoComprobante } from '../../src/utils/comprobante';
import { Trazo } from '../../src/utils/firma';

const crearEstilos = ({ colores, espacio, fuente }: Tema) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: colores.fondo },
    contenido: { padding: espacio.grande },
    grupo: { marginTop: espacio.medio },
    espacio: { height: espacio.chico },
    tip: { marginTop: espacio.chico, fontSize: fuente.chica, color: colores.textoSuave },
    vacio: { flex: 1, justifyContent: 'center', backgroundColor: colores.fondo },
  });

const Comprobante = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);
  const tarjeta = useRef<View>(null);
  const escalaSello = useRef(new Animated.Value(1)).current;
  const [sello, setSello] = useState(sellos[0]);
  const [trazos, setTrazos] = useState<Trazo[]>([]);

  const reserva = useTurnosStore((state) => state.reservas.find((item) => item.id === id));
  const adjuntarOrden = useTurnosStore((state) => state.adjuntarOrden);
  const { data: paciente } = usePaciente(reserva?.pacienteId ?? 0);

  const cambiarSello = () => {
    setSello((actual) => elegirSelloDistinto(actual));
    Animated.sequence([
      Animated.spring(escalaSello, { toValue: 1.8, useNativeDriver: true }),
      Animated.spring(escalaSello, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const { inclinacion, disponible } = useAcelerometro({
    onSacudida: cambiarSello,
    onVolcado: cambiarSello,
  });

  const rotar = inclinacion.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

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
      await adjuntarOrden(reserva.id, await conservarImagen(resultado.assets[0].uri));
    }
  };

  const compartirImagen = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        avisar('No se puede compartir acá', 'Probá desde el celular.');
        return;
      }

      const uri = await captureRef(tarjeta, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartir comprobante',
      });
    } catch {
      avisar('No se pudo compartir el comprobante', 'Probá de nuevo.');
    }
  };

  const compartirTexto = async () => {
    await Share.share({
      message: textoComprobante(reserva, paciente ?? null, sello),
    });
  };

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={[estilos.contenido, { paddingBottom: insets.bottom + 24 }]}
    >
      <Stack.Screen options={{ title: 'Comprobante' }} />

      <Animated.View style={{ transform: [{ rotate: rotar }] }}>
        <ComprobanteCard
          reserva={reserva}
          paciente={paciente}
          cardRef={tarjeta}
          sello={sello}
          escalaSello={escalaSello}
        >
          <FirmaPad trazos={trazos} onCambiar={setTrazos} />
        </ComprobanteCard>
      </Animated.View>

      <Text style={estilos.tip}>
        {disponible
          ? 'Inclinalo para girar el comprobante · agitalo para cambiar el sello'
          : 'Este dispositivo no tiene acelerómetro'}
      </Text>

      {trazos.length > 0 ? (
        <View style={estilos.grupo}>
          <Boton
            titulo="Borrar firma"
            icono="trash-outline"
            variante="peligro"
            onPress={() => setTrazos([])}
            testID="boton-borrar-firma"
          />
        </View>
      ) : null}

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
