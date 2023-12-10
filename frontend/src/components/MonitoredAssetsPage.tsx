import React, { useState, useEffect } from 'react';
import { MonitoredAsset } from '../types/types';
import { getMonitoredAssets } from '../api';
import { Link } from 'react-router-dom';
import './../styles/MonitoredAssetsPage.css';
import MonitoredAssetItem from './MonitoredAssetItem';


const MonitoredAssetsPage: React.FC = () => {
    const [monitoredAssets, setMonitoredAssets] = useState<MonitoredAsset[]>([]);
    const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

    useEffect(() => {
        const fetchMonitoredAssets = () => {
            getMonitoredAssets()
                .then(assets => setMonitoredAssets(assets))
                .catch(error => console.error('Error fetching monitored assets:', error));
        };

        fetchMonitoredAssets();

        const intervalId = setInterval(fetchMonitoredAssets, 10000); // 10 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="monitored-assets-container">
            <h2>Ativos Monitorados</h2>
            <div className='monitored-assets-list'>
                {monitoredAssets.map(monitoredAsset => (
                    <MonitoredAssetItem
                        asset={monitoredAsset}
                        isExpanded={expandedAsset === monitoredAsset.symbol}
                        setExpandedAsset={setExpandedAsset}
                    />
                ))}
            </div>
            <Link to="/manage-assets" className="manage-assets-link">Gerenciar Ativos</Link>
        </div>
    );
};

export default MonitoredAssetsPage;
