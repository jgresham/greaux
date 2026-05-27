import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeslaPage from './pages/Tesla';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tesla" element={<TeslaPage />} />
      </Routes>
    </HashRouter>
  );
}
