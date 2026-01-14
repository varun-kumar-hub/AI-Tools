import React from 'react';
import logoImage from '../assets/logo.png';

const Logo = ({ className = "", height = "h-12" }) => {
    return (
        <div className={`flex items-center gap-2 group ${className}`}>
            <img
                src={logoImage}
                alt="AI Tool Store"
                className={`${height} w-auto object-contain group-hover:scale-105 transition-transform`}
            />
        </div>
    );
};

export default Logo;
