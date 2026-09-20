'use client';

import React from 'react';
import { useFootball } from '@/context/FootballContext';
import { ETLQuotaMonitorTab } from './ETLQuotaMonitorTab';

export default function ETLQuotaMonitorPage() {
  const { quotaUsed, setQuotaUsed } = useFootball();

  return (
    <ETLQuotaMonitorTab
      quotaUsed={quotaUsed}
      setQuotaUsed={setQuotaUsed}
    />
  );
}
