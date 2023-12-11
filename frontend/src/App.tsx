
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MonitoredAssetsPage from './components/MonitoredAssetsPage';
import AssetList from './components/AssetListPage';
import { getAssets, enableMonitoring, disableMonitoring, getMonitoredAssets } from './api';
import { Asset } from './types/types';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {

    getAssets()
      .then(response => {
        let allAssets = response.data;

        getMonitoredAssets()
          .then(monitoredAssets => {
            monitoredAssets.forEach(monitoredAsset => {
              allAssets = allAssets.map(asset =>
                asset.symbol === monitoredAsset.symbol ? { ...asset, is_monitored: true } : asset
              );
            });
            setAssets(allAssets);
          }).catch(error => console.error('Error fetching monitored assets:', error));

      })
      .catch(error => console.error('Error fetching assets:', error));
  }, []);

  const handleDisableMonitoring = (symbol: string) => {
    disableMonitoring(symbol).then(() => {
      setAssets(assets.map(asset =>
        asset.symbol === symbol ? { ...asset, is_monitored: false } : asset
      ));
    });
  };

  const handleEnableMonitoring = (symbol: string, lower_tunnel: number, upper_tunnel: number, frequency: number, email: string) => {
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
