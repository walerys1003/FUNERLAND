'use client';

import { useState } from 'react';
import CondolenceForm from './condolence-form';
import CondolenceList from './condolence-list';

type Condolence = {
  id: string;
  authorName: string;
  text: string;
  relation?: string;
  createdAt: string;
};

type Props = {
  slug: string;
  initial?: Condolence[];
};

/**
 * Composite client component that wires CondolenceForm → CondolenceList refresh.
 * Server provides `initial` condolences for instant first paint, then
 * subsequent submissions trigger a fetch via incrementing refreshKey.
 */
export default function CondolenceSection({ slug, initial }: Props) {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="space-y-5">
      <CondolenceList slug={slug} initial={initial} refreshKey={refresh} />
      <CondolenceForm slug={slug} onAdded={() => setRefresh((r) => r + 1)} />
    </div>
  );
}
