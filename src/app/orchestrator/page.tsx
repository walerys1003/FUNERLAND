import type { Metadata } from 'next';
import OrchestratorDashboard from '@/components/orchestrator/dashboard';
import tasksPlan from '@/lib/tasks-plan.json';
import agentsConfig from '../../../orchestrator/agents.config.json';

export const metadata: Metadata = {
  title: 'Orchestrator AI · 11 agentów · 1000 tasków (Phase 3) · Polskie Pogrzeby',
  description:
    'System multi-agent orchestrator Phase 3: 11 wyspecjalizowanych agentów AI pracujących równolegle nad 1000 taskami: Builder, Designer, Content, Outreach, SEO, GTM, Search, Marketplace, AI, DevOps, QA.',
};

export default function OrchestratorPage() {
  return (
    <OrchestratorDashboard
      agents={agentsConfig.agents as any}
      initialTasks={tasksPlan.tasks as any}
      counts={tasksPlan.counts as any}
      total={tasksPlan.total}
      generatedAt={tasksPlan.generatedAt}
    />
  );
}
