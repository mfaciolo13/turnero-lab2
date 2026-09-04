import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PantallaTurnos from './src/screens/PantallaTurnos';

const App = () => (
  <SafeAreaProvider>
    <StatusBar style="light" />
    <PantallaTurnos />
  </SafeAreaProvider>
);

export default App;
