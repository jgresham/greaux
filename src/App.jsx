import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeslaPage from './pages/Tesla';
import SpaceXPage from './pages/SpaceX';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tesla" element={<TeslaPage />} />
        <Route path="/spacex" element={<SpaceXPage />} />
      </Routes>
    </HashRouter>
  );
}
