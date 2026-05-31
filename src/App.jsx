import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeslaPage from './pages/Tesla';
import SpaceXPage from './pages/SpaceX';
import UniswapPage from './pages/Uniswap';
import EliLillyPage from './pages/EliLilly';
import NvidiaPage from './pages/Nvidia';
import AmdPage from './pages/AMD';
import ApplePage from './pages/Apple';
import MicrosoftPage from './pages/Microsoft';
import GooglePage from './pages/Google';
import AmazonPage from './pages/Amazon';
import AsmlPage from './pages/ASML';
import TsmcPage from './pages/TSMC';
import RobinhoodPage from './pages/Robinhood';

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
        <Route path="/amd" element={<AmdPage />} />
        <Route path="/apple" element={<ApplePage />} />
        <Route path="/microsoft" element={<MicrosoftPage />} />
        <Route path="/google" element={<GooglePage />} />
        <Route path="/amazon" element={<AmazonPage />} />
        <Route path="/asml" element={<AsmlPage />} />
        <Route path="/tsmc" element={<TsmcPage />} />
        <Route path="/robinhood" element={<RobinhoodPage />} />
      </Routes>
    </HashRouter>
  );
}
