import { File, Paths } from 'expo-file-system';

export const conservarImagen = async (uriOrigen: string) => {
  try {
    const origen = new File(uriOrigen);
    const destino = new File(Paths.document, `orden-${Date.now()}.jpg`);
    await origen.copy(destino);
    return destino.uri;
  } catch {
    return uriOrigen;
  }
};
