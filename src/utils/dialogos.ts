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
