import React from 'react';
import './../styles/SearchBox.css';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const SearchBox: React.FC<Props> = ({ value, onChange }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Procurar ativos..."
            className="search-box"
        />
    );
};

export default SearchBox;
