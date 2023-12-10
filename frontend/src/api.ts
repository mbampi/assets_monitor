import axios from 'axios';
import { Asset, MonitoredAsset, Quotation } from './types/types';

const API_URL = 'http://localhost:8000';

export const getAssets = () => axios.get<Asset[]>(`${API_URL}/assets/`);
export const getAsset = (symbol: string) => axios.get<Asset>(`${API_URL}/assets/${symbol}`);
export const getQuotations = (symbol: string) => axios.get<Quotation[]>(`${API_URL}/assets/quotation/${symbol}`);
export const getLastQuotations = (symbol: string, n: number) => axios.get(`${API_URL}/assets/quotation/${symbol}?n=${n}`);
export const getMonitoredAssets = () => axios.get<MonitoredAsset[]>(`${API_URL}/assets/monitored`).then(res => res.data.map((asset: MonitoredAsset) => ({
    ...asset,
    last_price: Number(asset.last_price),
    lower_tunnel: Number(asset.lower_tunnel),
    upper_tunnel: Number(asset.upper_tunnel),
})));
export const disableMonitoring = (symbol: string) => axios.post(`${API_URL}/assets/disable-monitoring/${symbol}`);
export const enableMonitoring = (symbol: string, email: string, lower_tunnel: number, upper_tunnel: number, frequency: number) =>
    axios.post(`${API_URL}/assets/enable-monitoring/${symbol}`, { email, lower_tunnel, upper_tunnel, frequency });