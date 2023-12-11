import React, { useState } from 'react';
import { Asset } from '../types/types';
import SearchBox from './SearchBox';
import { Link } from 'react-router-dom';
import './../styles/AssetListPage.css';
import EnableMonitoringModal from './EnableMonitoringModal';
import { FaFilter } from 'react-icons/fa';

interface Props {
    assets: Asset[];
    onDisableMonitoring: (symbol: string) => void;
    onEnableMonitoring: (symbol: string, lower_tunnel: number, upper_tunnel: number, frequency: number, email: string) => void;
}

const AssetList: React.FC<Props> = ({ assets, onEnableMonitoring, onDisableMonitoring }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [showMonitoredOnly, setShowMonitoredOnly] = useState(false);
    const filteredAssets = assets
        .filter(asset => asset.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(asset => !showMonitoredOnly || asset.is_monitored);

    const openModal = (asset: Asset) => {
        setSelectedAsset(asset);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div className='asset-list-container'>
            <Link to="/">Voltar</Link>
            <h2>Ativos Disponíveis</h2>
            <div className="asset-list-header">
                <SearchBox value={searchTerm} onChange={setSearchTerm} />
                <button
                    className="filter-button"
                    onClick={() => setShowMonitoredOnly(!showMonitoredOnly)}>
                    <FaFilter />
                </button>
            </div>
            <ul>
                {filteredAssets.map(asset => (
                    <li key={asset.symbol} className='asset-item'>
                        <span className='asset-symbol'>
                            {asset.symbol}
                        </span>
                        <span className="asset-name">
                            {asset.name}
                        </span>
                        {asset.is_monitored ? (
                            <button onClick={() => onDisableMonitoring(asset.symbol)}>
                                Desativar Monitoramento
                            </button>
                        ) : (
                            <button onClick={() => openModal(asset)}>
                                Ativar Monitoramento
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            <EnableMonitoringModal
                asset={selectedAsset!}
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                onEnableMonitoring={onEnableMonitoring}
            />
        </div>
    );
};

export default AssetList;
