
export interface Asset {
    symbol: string;
    name: string;
    is_monitored: boolean;
    price: number; // optional
}

export interface MonitoredAsset {
    symbol: string;
    name: string;
    lower_tunnel: number;
    upper_tunnel: number;
    email: string;
    last_price: number;
    frequency: number; // in minutes
}

export interface Quotation {
    date: string;
    time: string;
    price: number;
}