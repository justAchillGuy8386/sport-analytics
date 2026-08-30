'use client';

import React from 'react';

interface TeamLogoProps {
  logo: string;
  name?: string;
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ logo, name, className = 'w-6 h-6' }) => {
  if (logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/'))) {
    return (
      <img
        src={logo}
        alt={name || 'Team logo'}
        className={`${className} object-contain inline-block shrink-0`}
        onError={(e) => {
          // Fallback if image fails to load
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  return <span className="inline-block shrink-0">{logo}</span>;
};
