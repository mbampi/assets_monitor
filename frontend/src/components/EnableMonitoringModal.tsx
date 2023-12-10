import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Asset } from '../types/types';
import './../styles/EnableMonitoringModal.css';
import { getAsset } from '../api';

Modal.setAppElement('#root');

type Props = {
    asset: Asset;
    isOpen: boolean;
    onRequestClose: () => void;
    onEnableMonitoring: (symbol: string, lower_tunnel: number, upper_tunnel: number, frequency: number) => void;
};

const EnableMonitoringModal: React.FC<Props> = ({ asset, isOpen, onRequestClose, onEnableMonitoring }) => {
    const [lowerTunnel, setLowerTunnel] = useState('');
    const [upperTunnel, setUpperTunnel] = useState('');
    const [frequency, setFrequency] = useState('');
    const [currentPrice, setCurrentPrice] = useState<number>(0);

    // when modal opens, get the current price of the asset requesting the asset details endpoint
    // when modal closes, clear the current price.
    useEffect(() => {
        if (isOpen) {
            getAsset(asset.symbol).then(response => {
                setCurrentPrice(response.data.price);
            }).catch(error => console.error('Error fetching asset:', error));
        } else {
            setCurrentPrice(0);
        }
    }, [isOpen, asset]);

    const handleEnableMonitoring = () => {
        onEnableMonitoring(asset.symbol, parseFloat(lowerTunnel), parseFloat(upperTunnel), parseInt(frequency));
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Monitoramento de Ativos"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <h2>Monitoramento de {asset?.symbol}</h2>
            {currentPrice > 0 &&
                <span>preço atual: R$ {currentPrice?.toFixed(2)}</span>
            }
            <p>Informe os valores de túnel inferior e superior, além da frequência de monitoramento, em minutos.</p>
            <input
                type="number"
                value={lowerTunnel}
                onChange={(e) => setLowerTunnel(e.target.value)}
                placeholder="Túnel Inferior"
            />
            <input
                type="number"
                value={upperTunnel}
                onChange={(e) => setUpperTunnel(e.target.value)}
                placeholder="Túnel Superior"
            />
            <input
                type="number"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="Frequência de Monitoramento (minutos)"
            />
            <button onClick={handleEnableMonitoring}>Confirmar</button>
            <button onClick={onRequestClose}>Fechar</button>
        </Modal>
    );
};

export default EnableMonitoringModal;
