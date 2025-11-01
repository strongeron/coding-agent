import { ThemeProvider } from './contexts/ThemeContext';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
