import React, { useState, useEffect } from 'react';
import { MonitoredAsset, Quotation } from '../types/types';
import { getLastQuotations, getMonitoredAssets } from '../api';
import { Link } from 'react-router-dom';
import { FaTag, FaStopwatch } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './../styles/MonitoredAssetsPage.css';

const MonitoredAssetsPage: React.FC = () => {
    const [monitoredAssets, setMonitoredAssets] = useState<MonitoredAsset[]>([]);
    const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
    const [quotationData, setQuotationData] = useState<{ [symbol: string]: Quotation[] }>({});

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

    const fetchQuotationsForAsset = async (symbol: string) => {
        if (expandedAsset === symbol) {
            setExpandedAsset(null);
        } else {
            setExpandedAsset(symbol);
            try {
                const response = await getLastQuotations(symbol, 100);
                setQuotationData(prevData => ({ ...prevData, [symbol]: response.data }));
            } catch (error) {
                console.error('Error fetching quotations:', error);
            }
        }
    };

    const renderChart = (symbol: string) => {
        const data = quotationData[symbol] || [];
        if (data.length === 0) {
            return <span className='chart-waiting-data'>Aguardando dados...</span>;
        }

        const formattedData = data.map(q => ({ ...q, dateTime: `${q.date} ${q.time}` }));

        let maxPrice = Math.max(...formattedData.map(q => q.price));
        maxPrice = maxPrice * 1.001;

        let minPrice = Math.min(...formattedData.map(q => q.price));
        minPrice = minPrice * 0.999;

        console.log(minPrice, maxPrice)


        return (
            <LineChart width={500} height={300} data={formattedData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="dateTime" stroke="#216d76" />
                <YAxis domain={[minPrice, maxPrice]} stroke="#216d76" />
                <Tooltip wrapperStyle={{ backgroundColor: '#216d76', color: 'white' }} />
                <CartesianGrid strokeDasharray="6 6" />
                <Line type={'natural'} dataKey="price" stroke="#ff7300" strokeWidth={2} dot={false} />
            </LineChart>
        );
    };

    return (
        <div className="monitored-assets-container">
            <h2>Ativos Monitorados</h2>
            <ul>
                {monitoredAssets.map(monitoredAsset => (
                    <li key={monitoredAsset.symbol}
                        className={`asset-item ${expandedAsset === monitoredAsset.symbol ? 'expanded' : ''}`}
                        onClick={() => fetchQuotationsForAsset(monitoredAsset.symbol)}>
                        <div className="asset-info">
                            <div className="asset-name">
                                <span>{monitoredAsset.symbol} ({monitoredAsset.name})</span>
                            </div>
                            <div className="asset-price">
                                <FaTag />
                                <span>R$ {monitoredAsset.last_price}</span>
                            </div>

                            <div className="asset-frequency">
                                <FaStopwatch />
                                <span>{monitoredAsset.frequency} minutos</span>
                            </div>

                            <div className="asset-roof">
                                <span>Túnel superior: R$ {monitoredAsset.upper_tunnel.toFixed(2)}</span>
                            </div>
                            <div className="asset-floor">
                                <span>Túnel inferior: R$ {monitoredAsset.lower_tunnel.toFixed(2)}</span>
                            </div>

                            {expandedAsset === monitoredAsset.symbol && quotationData[monitoredAsset.symbol] && (
                                <div className="asset-chart">
                                    {renderChart(monitoredAsset.symbol)}
                                </div>

                            )}
                        </div>
                    </li>
                ))}
            </ul>
            <Link to="/manage-assets" className="manage-assets-link">Gerenciar Ativos</Link>
        </div>
    );
};

export default MonitoredAssetsPage;
