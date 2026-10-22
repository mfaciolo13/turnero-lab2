import { useMemo, useRef, useState } from 'react';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Boton from '../src/components/Boton';
import { useTurnosStore } from '../src/store/turnos';
import { useTheme } from '../src/theme/ThemeProvider';
import { Tema } from '../src/theme/tema';
import { avisar } from '../src/utils/dialogos';

const crearEstilos = ({ colores, espacio, fuente }: Tema) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: '#000' },
    centro: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: espacio.grande,
      backgroundColor: colores.fondo,
    },
    aviso: {
      fontSize: fuente.normal,
      color: colores.texto,
      textAlign: 'center',
      marginBottom: espacio.medio,
    },
    espacio: { height: espacio.chico },
    barra: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingTop: espacio.grande,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    lateral: { width: 72, alignItems: 'center' },
    lateralTexto: { color: '#fff', fontSize: fuente.normal, fontWeight: '600' },
    disparador: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 4,
      borderColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    disparadorInterior: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff' },
    disparadorApagado: { opacity: 0.4 },
  });

const Camara = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);
  const { reservaId } = useLocalSearchParams<{ reservaId: string }>();
  const adjuntarOrden = useTurnosStore((state) => state.adjuntarOrden);
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [lado, setLado] = useState<CameraType>('back');
  const [lista, setLista] = useState(false);
  const camara = useRef<CameraView>(null);

  if (!permiso) {
    return <View style={estilos.pantalla} />;
  }

  if (!permiso.granted) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.aviso}>Necesitamos permiso para usar la cámara</Text>
        {permiso.canAskAgain ? (
          <Boton titulo="Conceder permiso" icono="camera" onPress={pedirPermiso} />
        ) : (
          <Boton titulo="Abrir ajustes" icono="settings" onPress={() => Linking.openSettings()} />
        )}
        <View style={estilos.espacio} />
        <Boton titulo="Volver" variante="secundario" onPress={() => router.back()} />
      </View>
    );
  }

  const sacarFoto = async () => {
    if (!camara.current || !lista) {
      return;
    }

    try {
      const foto = await camara.current.takePictureAsync({ quality: 0.7 });
      if (foto && reservaId) {
        adjuntarOrden(reservaId, foto.uri);
        router.back();
      }
    } catch {
      avisar('No se pudo sacar la foto', 'Probá de nuevo.');
    }
  };

  return (
    <View style={estilos.pantalla}>
      <CameraView
        ref={camara}
        style={StyleSheet.absoluteFill}
        facing={lado}
        onCameraReady={() => setLista(true)}
      />
      <View style={[estilos.barra, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={estilos.lateral} onPress={() => router.back()}>
          <Text style={estilos.lateralTexto}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[estilos.disparador, !lista && estilos.disparadorApagado]}
          onPress={sacarFoto}
          disabled={!lista}
          testID="disparador"
        >
          <View style={estilos.disparadorInterior} />
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.lateral}
          onPress={() => setLado((actual) => (actual === 'back' ? 'front' : 'back'))}
        >
          <Ionicons name="camera-reverse" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Camara;
