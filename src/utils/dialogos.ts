import { Alert, Linking, Platform } from 'react-native';

export const avisar = (titulo: string, mensaje: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
};

export const confirmar = (titulo: string, mensaje: string, onAceptar: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensaje}`)) {
      onAceptar();
    }
    return;
  }

  Alert.alert(titulo, mensaje, [
    { text: 'Volver', style: 'cancel' },
    { text: 'Confirmar', onPress: onAceptar },
  ]);
};

export const pedirAjustes = (titulo: string, mensaje: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }

  Alert.alert(titulo, mensaje, [
    { text: 'Ahora no', style: 'cancel' },
    { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
  ]);
};

export const abrirAjustesUbicacion = () => {
  if (Platform.OS === 'android') {
    Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() =>
      Linking.openSettings(),
    );
    return;
  }

  Linking.openSettings();
};

export const avisarGpsApagado = () => {
  if (Platform.OS === 'web') {
    window.alert('GPS apagado\n\nEncendé la ubicación del dispositivo.');
    return;
  }

  Alert.alert('GPS apagado', 'Encendé la ubicación del celular para usar "Dónde estoy".', [
    { text: 'Ahora no', style: 'cancel' },
    { text: 'Abrir ajustes', onPress: abrirAjustesUbicacion },
  ]);
};
