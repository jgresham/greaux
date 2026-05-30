import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeslaPage from './pages/Tesla';
import SpaceXPage from './pages/SpaceX';
import UniswapPage from './pages/Uniswap';
import EliLillyPage from './pages/EliLilly';
import NvidiaPage from './pages/Nvidia';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tesla" element={<TeslaPage />} />
        <Route path="/spacex" element={<SpaceXPage />} />
        <Route path="/uniswap" element={<UniswapPage />} />
        <Route path="/lilly" element={<EliLillyPage />} />
        <Route path="/nvidia" element={<NvidiaPage />} />
      </Routes>
    </HashRouter>
  );
}
