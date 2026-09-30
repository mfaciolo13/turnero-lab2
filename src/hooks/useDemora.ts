import { useEffect, useState } from 'react';

export const useDemora = <T,>(valor: T, milisegundos = 400) => {
  const [demorado, setDemorado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDemorado(valor), milisegundos);
    return () => clearTimeout(temporizador);
  }, [valor, milisegundos]);

  return demorado;
};
