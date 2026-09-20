'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { slugifyTeam } from '@/utils/teamSlug';
import { TeamAnalyticsTab } from './TeamAnalyticsTab';

export default function TeamAnalyticsPage() {
  const router = useRouter();
  const { allMatches = [], matches = [] } = useFootball();

  const dataset = allMatches.length > 0 ? allMatches : matches;
  const firstTeam = dataset[0]?.homeTeam;

  useEffect(() => {
    if (firstTeam?.name) {
      const slug = slugifyTeam(firstTeam.name);
      if (slug) {
        router.replace(`/team/${slug}`);
      }
    }
  }, [firstTeam, router]);

  return <TeamAnalyticsTab />;
}
