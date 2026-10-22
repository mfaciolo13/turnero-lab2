import { File } from 'expo-file-system';
import { conservarImagen } from '../archivos';

const mockCopiar = jest.fn();

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: { document: 'documentos' },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(1234);
  jest.mocked(File).mockImplementation(((...partes: string[]) => ({
    uri: partes.join('/'),
    copy: mockCopiar,
  })) as never);
  mockCopiar.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('conservarImagen', () => {
  it('copia la imagen a la carpeta de documentos de la app', async () => {
    await conservarImagen('file:///cache/foto.jpg');

    expect(File).toHaveBeenCalledWith('file:///cache/foto.jpg');
    expect(File).toHaveBeenCalledWith('documentos', 'orden-1234.jpg');
    expect(mockCopiar).toHaveBeenCalledTimes(1);
  });

  it('devuelve la nueva ubicación de la imagen', async () => {
    const uri = await conservarImagen('file:///cache/foto.jpg');

    expect(uri).toBe('documentos/orden-1234.jpg');
  });

  it('devuelve la ubicación original si no se puede copiar', async () => {
    mockCopiar.mockRejectedValue(new Error('sin espacio'));

    const uri = await conservarImagen('file:///cache/foto.jpg');

    expect(uri).toBe('file:///cache/foto.jpg');
  });
});
