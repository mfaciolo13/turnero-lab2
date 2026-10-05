import { createContext, ReactNode, useContext } from 'react';
import { Tema, tema } from './tema';

type Props = {
  theme: Tema;
  children: ReactNode;
};

const TemaContext = createContext<Tema>(tema);

export const ThemeProvider = ({ theme, children }: Props) => (
  <TemaContext.Provider value={theme}>{children}</TemaContext.Provider>
);

export const useTheme = () => useContext(TemaContext);
