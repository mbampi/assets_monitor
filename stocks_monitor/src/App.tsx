
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MonitoredAssetsPage from './components/MonitoredAssetsPage';
import AssetList from './components/AssetList';
import { getAssets, enableMonitoring, disableMonitoring } from './api';
import { Asset } from './types/types';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const email = ""

  useEffect(() => {
    getAssets().then(response => setAssets(response.data));
  }, []);

  const handleDisableMonitoring = (symbol: string) => {
    disableMonitoring(symbol).then(() => {
      setAssets(assets.map(asset =>
        asset.symbol === symbol ? { ...asset, is_monitored: false } : asset
      ));
    });
  };

  const handleEnableMonitoring = (symbol: string, lower_tunnel: number, upper_tunnel: number, frequency: number) => {
    enableMonitoring(symbol, email, lower_tunnel, upper_tunnel, frequency).then(() => {
      setAssets(assets.map(asset =>
        asset.symbol === symbol ? { ...asset, is_monitored: true } : asset
      ));
    });
  }


  return (
    <Router>
      <Routes>
        <Route path="/" Component={MonitoredAssetsPage} />
        <Route path="/manage-assets" Component={() => (
          <AssetList
            assets={assets}
            onEnableMonitoring={handleEnableMonitoring}
            onDisableMonitoring={handleDisableMonitoring}
          />
        )} />
      </Routes>
    </Router>
  );
};

export default App;
