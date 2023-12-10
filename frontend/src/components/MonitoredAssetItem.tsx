import { FaTag, FaStopwatch } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getLastQuotations, } from '../api';
import { MonitoredAsset, Quotation } from '../types/types';
import { useState } from 'react';
import './../styles/MonitoredAssetItem.css';


interface Props {
    asset: MonitoredAsset;
    isExpanded: boolean;
    setExpandedAsset: (symbol: string | null) => void;
}

const MonitoredAssetItem: React.FC<Props> = ({ asset, isExpanded, setExpandedAsset }) => {
    const [quotationData, setQuotationData] = useState<Quotation[]>([]);

    const formatDecimal = (value: number) => {
        return value.toFixed(4);
    };

    // formatTime to display only hours, minutes, and seconds
    const formatTime = (value: any) => {
        const parts = value.split(':'); // Split the string by colon
        if (parts.length >= 3) {
            const hours = parts[0];
            const minutes = parts[1];
            const seconds = parts[2].split('.')[0]; // Split by dot and take only the seconds part
            return `${hours}:${minutes}:${seconds}`;
        }
        return value; // Return the original value if it's not in the expected format
    };

    const renderChart = () => {
        if (quotationData.length === 0) {
            return <span className='chart-waiting-data'>Aguardando dados...</span>;
        }

        const formattedData = quotationData.map(q => ({
            ...q,
            time: q.time,
        }));

        // invert the array so that the chart shows the oldest data first
        formattedData.reverse();

        let maxPrice = Math.max(...formattedData.map(q => q.price));
        maxPrice = maxPrice * 1.01;

        let minPrice = Math.min(...formattedData.map(q => q.price));
        minPrice = minPrice * 0.99;

        console.log("minPrice", minPrice, "maxPrice", maxPrice);

        return (
            <LineChart
                width={850}
                height={300}
                data={formattedData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis dataKey="time" stroke="#216d76" tickFormatter={formatTime} />
                <YAxis domain={[minPrice, maxPrice]} stroke="#216d76" tickFormatter={formatDecimal} />
                <Tooltip wrapperStyle={{ backgroundColor: '#216d76', color: 'white' }} />
                <CartesianGrid strokeDasharray="6 6" />
                <Line type={'natural'} dataKey="price" stroke="#ff7300" strokeWidth={2} dot={false} />
            </LineChart>
        );
    };

    const fetchQuotations = async () => {
        if (isExpanded) {
            setExpandedAsset(null);
        } else {
            setExpandedAsset(asset.symbol);
            try {
                const response = await getLastQuotations(asset.symbol, 100);
                setQuotationData(response.data);
            } catch (error) {
                console.error('Error fetching quotations:', error);
            }
        }
    };

    return (<div key={asset.symbol}
        className={`asset-item ${isExpanded ? 'expanded' : ''}`}
        onClick={() => fetchQuotations()}>
        <div className="asset-info">
            <div className="asset-name">
                <span>{asset.symbol} ({asset.name})</span>
            </div>
            <div className="asset-price">
                <FaTag />
                <span>R$ {asset.last_price}</span>
            </div>

            <div className="asset-frequency">
                <FaStopwatch />
                <span>{asset.frequency} minutos</span>
            </div>
            <div> Túnel </div>

            <div className="asset-roof">
                <span>superior: R$ {asset.upper_tunnel.toFixed(2)}</span>
            </div>
            <div className="asset-floor">
                <span>inferior: R$ {asset.lower_tunnel.toFixed(2)}</span>
            </div>

        </div>
        {isExpanded && quotationData.length > 0 && (
            <div className="asset-chart">
                {renderChart()}
            </div>
        )}
    </div>);
}

export default MonitoredAssetItem;