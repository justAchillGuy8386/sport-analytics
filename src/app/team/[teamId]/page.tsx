'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TeamAnalyticsTab } from '../TeamAnalyticsTab';

export default function TeamDetailPage() {
  const params = useParams();
  const teamIdParam = (params?.teamId as string) || '';

  return <TeamAnalyticsTab initialTeamSlugOrId={teamIdParam} />;
}
