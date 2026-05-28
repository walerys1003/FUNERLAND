'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Hammer,
  Palette,
  PenLine,
  Mail,
  TrendingUp,
  Rocket,
  Search,
  ShoppingBag,
  Server,
  Bot,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  Circle,
  Loader2,
  Activity,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

type Agent = {
  id: string;
  name: string;
  role: string;
  prompt: string;
  color: string;
  icon: string;
  tools: string[];
  taskCount: number;
  deliverables: string[];
};

type Task = {
  id: string;
  agent: string;
  title: string;
  sub: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'queued' | 'running' | 'completed';
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  output: string | null;
};

const ICONS: Record<string, any> = {
  Hammer,
  Palette,
  PenLine,
  Mail,
  TrendingUp,
  Rocket,
  Search,
  ShoppingBag,
  Sparkles,
  Server,
  Bot,
};

export default function OrchestratorDashboard({
  agents,
  initialTasks,
  counts,
  total,
  generatedAt,
}: {
  agents: Agent[];
  initialTasks: Task[];
  counts: Record<string, number>;
  total: number;
  generatedAt: string;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(8); // tasków na tick
  const [activeAgent, setActiveAgent] = useState<string>('all');
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Symulacja: na każdy tick przesuń kilka tasków per agent
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTasks((prev) => {
        const next = [...prev];
        const byAgent: Record<string, number[]> = {};
        next.forEach((t, i) => {
          if (!byAgent[t.agent]) byAgent[t.agent] = [];
          byAgent[t.agent].push(i);
        });

        // Dla każdego agenta: complete running -> start next queued
        Object.keys(byAgent).forEach((agentId) => {
          const indices = byAgent[agentId];
          const running = indices.filter((i) => next[i].status === 'running');
          running.forEach((idx) => {
            next[idx] = {
              ...next[idx],
              status: 'completed',
              completedAt: new Date().toISOString(),
              durationMs: 200 + Math.floor(Math.random() * 1200),
              output: pickOutput(next[idx]),
            };
          });
          // start nowe (ilość = speed / 6)
          const perAgent = Math.max(1, Math.floor(speed / 6));
          const queued = indices.filter((i) => next[i].status === 'queued');
          queued.slice(0, perAgent).forEach((idx) => {
            next[idx] = {
              ...next[idx],
              status: 'running',
              startedAt: new Date().toISOString(),
            };
          });
        });

        return next;
      });
      setTick((t) => t + 1);
    }, 600);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, speed]);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const runningC = tasks.filter((t) => t.status === 'running').length;
    const queued = tasks.filter((t) => t.status === 'queued').length;
    return { completed, running: runningC, queued, total: tasks.length };
  }, [tasks]);

  const perAgent = useMemo(() => {
    const map: Record<string, { completed: number; running: number; queued: number; total: number }> = {};
    agents.forEach((a) => {
      map[a.id] = { completed: 0, running: 0, queued: 0, total: 0 };
    });
    tasks.forEach((t) => {
      if (!map[t.agent]) return;
      map[t.agent].total++;
      if (t.status === 'completed') map[t.agent].completed++;
      else if (t.status === 'running') map[t.agent].running++;
      else map[t.agent].queued++;
    });
    return map;
  }, [tasks, agents]);

  const filteredTasks = useMemo(() => {
    if (activeAgent === 'all') return tasks;
    return tasks.filter((t) => t.agent === activeAgent);
  }, [tasks, activeAgent]);

  const recentCompleted = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.status === 'completed')
        .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
        .slice(0, 12),
    [tasks]
  );

  const reset = () => {
    setRunning(false);
    setTasks(initialTasks.map((t) => ({ ...t, status: 'queued', startedAt: null, completedAt: null, durationMs: null, output: null })));
    setTick(0);
  };

  const fastForward = () => {
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        status: 'completed',
        startedAt: t.startedAt || new Date(Date.now() - 60000).toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: t.durationMs || 200 + Math.floor(Math.random() * 1200),
        output: t.output || pickOutput(t),
      }))
    );
    setRunning(false);
  };

  const progressPct = (stats.completed / stats.total) * 100;

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-200">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-[#0B1220]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 ring-1 ring-emerald-500/30">
              <Cpu className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-heading text-xl text-white">AI Orchestrator</h1>
              <p className="text-xs text-slate-400">
                6 agentów · {total} tasków · Polskie Pogrzeby MVP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                running
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? 'Pauza' : 'Start'}
            </button>
            <button
              onClick={fastForward}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              <FastForward className="h-4 w-4" />
              Skok do końca
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <a
              href="/"
              className="ml-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              ← Portal
            </a>
          </div>
        </div>

        {/* Global progress bar */}
        <div className="border-t border-slate-800/70 bg-slate-900/50">
          <div className="mx-auto max-w-[1600px] px-6 py-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="font-mono text-slate-400">
                  {stats.completed}/{stats.total} tasków
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {stats.completed} done
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Loader2 className={`h-3 w-3 ${running ? 'animate-spin' : ''}`} />
                  {stats.running} running
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Circle className="h-3 w-3" />
                  {stats.queued} queued
                </span>
              </div>
              <span className="font-mono text-emerald-400">{progressPct.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {/* Agent cards grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const Icon = ICONS[agent.icon] || Activity;
            const ag = perAgent[agent.id];
            const pct = ag.total ? (ag.completed / ag.total) * 100 : 0;
            const isActive = activeAgent === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(isActive ? 'all' : agent.id)}
                className={`group relative overflow-hidden rounded-2xl border bg-slate-900/60 p-5 text-left transition ${
                  isActive
                    ? 'border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Color stripe */}
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: agent.color }}
                />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid h-11 w-11 place-items-center rounded-xl"
                      style={{ background: `${agent.color}33`, color: agent.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base text-white">{agent.name}</h3>
                      <p className="text-xs text-slate-400">{agent.role}</p>
                    </div>
                  </div>
                  {ag.running > 0 && (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                  )}
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-mono text-2xl text-white">
                    {ag.completed}
                    <span className="text-base text-slate-500">/{ag.total}</span>
                  </span>
                  <span className="text-xs text-slate-400">{pct.toFixed(0)}%</span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${agent.color}, ${agent.color}cc)`,
                    }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {agent.tools.slice(0, 4).map((tool) => (
                    <span
                      key={tool}
                      className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-400"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                  <div className="rounded-md bg-emerald-500/10 px-2 py-1 text-center text-emerald-400">
                    {ag.completed} done
                  </div>
                  <div className="rounded-md bg-amber-500/10 px-2 py-1 text-center text-amber-400">
                    {ag.running} run
                  </div>
                  <div className="rounded-md bg-slate-800/60 px-2 py-1 text-center text-slate-400">
                    {ag.queued} queue
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Below: 2-column layout — task list + activity feed */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          {/* Task list */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <h2 className="font-heading text-base text-white">
                  Lista tasków
                  {activeAgent !== 'all' && (
                    <span className="ml-2 text-sm text-slate-400">
                      · filtr: {agents.find((a) => a.id === activeAgent)?.name}
                    </span>
                  )}
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-500">
                {filteredTasks.length} tasków
              </span>
            </div>

            <div className="max-h-[640px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-900 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">ID</th>
                    <th className="px-4 py-2 text-left font-medium">Agent</th>
                    <th className="px-4 py-2 text-left font-medium">Task</th>
                    <th className="px-4 py-2 text-left font-medium">Prio</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.slice(0, 200).map((task) => {
                    const agent = agents.find((a) => a.id === task.agent);
                    return (
                      <tr
                        key={task.id}
                        className="border-t border-slate-800/60 hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-2 font-mono text-xs text-slate-500">{task.id}</td>
                        <td className="px-4 py-2">
                          <span
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                            style={{
                              background: `${agent?.color}33`,
                              color: agent?.color,
                            }}
                          >
                            {task.agent}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-300">
                          <div className="text-sm">{task.title}</div>
                          <div className="text-[10px] text-slate-500">{task.sub}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                              task.priority === 'P0'
                                ? 'bg-red-500/20 text-red-400'
                                : task.priority === 'P1'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {task.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              done
                            </span>
                          )}
                          {task.status === 'running' && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              running
                            </span>
                          )}
                          {task.status === 'queued' && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Circle className="h-3 w-3" />
                              queued
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredTasks.length > 200 && (
                <div className="px-4 py-3 text-center text-xs text-slate-500">
                  Pokazano 200/{filteredTasks.length}. Włącz filtr agenta aby zobaczyć więcej.
                </div>
              )}
            </div>
          </section>

          {/* Activity feed + deliverables */}
          <aside className="space-y-6">
            {/* Recent activity */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h2 className="font-heading text-base text-white">Ostatnia aktywność</h2>
              </div>
              <div className="max-h-[300px] space-y-2 overflow-y-auto p-3">
                {recentCompleted.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Naciśnij <span className="font-mono text-emerald-400">Start</span> żeby uruchomić agentów
                  </div>
                )}
                {recentCompleted.map((task) => {
                  const agent = agents.find((a) => a.id === task.agent);
                  return (
                    <div
                      key={task.id}
                      className="flex gap-3 rounded-lg border border-slate-800/50 bg-slate-900/40 p-2.5"
                    >
                      <div
                        className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: agent?.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="font-mono">{task.id}</span>
                          <span>·</span>
                          <span style={{ color: agent?.color }}>{agent?.name.split('—')[0].trim()}</span>
                          <span>·</span>
                          <span className="text-emerald-400">{task.durationMs}ms</span>
                        </div>
                        <div className="truncate text-xs text-slate-300">{task.title}</div>
                        {task.output && (
                          <div className="mt-1 truncate font-mono text-[10px] text-slate-500">
                            ✓ {task.output}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Deliverables */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h2 className="font-heading text-base text-white">Deliverables</h2>
              </div>
              <div className="space-y-4 p-5">
                {agents.map((agent) => (
                  <div key={agent.id}>
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: agent.color }}
                      />
                      <span className="font-medium text-slate-300">
                        {agent.name.split('—')[1]?.trim() || agent.name}
                      </span>
                    </div>
                    <ul className="space-y-1 pl-4">
                      {agent.deliverables.slice(0, 4).map((d, i) => (
                        <li key={i} className="text-[11px] text-slate-500">
                          · {d}
                        </li>
                      ))}
                      {agent.deliverables.length > 4 && (
                        <li className="text-[11px] text-slate-600">
                          + {agent.deliverables.length - 4} więcej
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        {/* Footer info */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-xs text-slate-500">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="text-slate-400">Wygenerowano</div>
              <div className="font-mono text-slate-300">{new Date(generatedAt).toLocaleString('pl-PL')}</div>
            </div>
            <div>
              <div className="text-slate-400">Tick</div>
              <div className="font-mono text-emerald-400">#{tick}</div>
            </div>
            <div>
              <div className="text-slate-400">Speed</div>
              <div className="font-mono text-amber-400">{speed} tasks/600ms</div>
            </div>
            <div>
              <div className="text-slate-400">Target</div>
              <div className="font-mono text-slate-300">10 000 zł MRR w 90 dni</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function pickOutput(task: Task): string {
  const outputs: Record<string, string[]> = {
    builder: [
      'src/lib/supabase/client.ts',
      'supabase/schema.sql',
      'src/app/api/lead/route.ts',
      'src/lib/stripe.ts',
      'src/lib/resend.ts',
      '.env.example',
    ],
    designer: [
      'src/components/icons/coffin.tsx',
      'tailwind.config.ts',
      'src/components/ui/button.tsx',
      'src/components/icons/urn.tsx',
    ],
    content: [
      'src/content/articles/ile-kosztuje-pogrzeb.mdx',
      'src/content/articles/zasilek-pogrzebowy-zus-2026.mdx',
      'src/content/articles/jak-wybrac-zaklad-pogrzebowy.mdx',
    ],
    outreach: [
      'outreach/emails/01-pierwsze-spotkanie.md',
      'outreach/sms/01-pierwsze-spotkanie.txt',
      'outreach/phone-script.md',
    ],
    seo: [
      'src/app/sitemap.ts',
      'src/app/robots.ts',
      'src/app/[city]/[category]/page.tsx',
      'src/lib/seo/json-ld.ts',
    ],
    gtm: [
      'gtm/launch-checklist.md',
      'gtm/30-day-plan.md',
      'gtm/kpi-dashboard.md',
    ],
  };
  const list = outputs[task.agent] || ['output.md'];
  return list[Math.floor(Math.random() * list.length)];
}
