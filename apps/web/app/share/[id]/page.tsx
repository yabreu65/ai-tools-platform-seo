'use client';

import React from 'react';
import { SharedResultView } from '@/components/share/SharedResultView';

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  return (
    <SharedResultView 
      shareId={id}
      isEmbedded={false}
      showComments={true}
    />
  );
}