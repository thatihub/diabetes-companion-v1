import Link from "next/link";

const EXTERNAL_LINKS = [
  {
    label: "Live Frontend",
    href: "https://diabetes-companion-web.onrender.com",
    description: "Public web app on Render.",
  },
  {
    label: "API Service",
    href: "https://diabetes-companion-api.onrender.com",
    description: "Backend health and API routes.",
  },
  {
    label: "GitHub Repository",
    href: "https://github.com/thatihub/diabetes-companion-v1",
    description: "Source of truth for code and deploys.",
  },
];

const INTERNAL_LINKS = [
  {
    label: "Dexcom Support Email",
    href: "/project-cabinet/dexcom-email",
    description: "Production access request template and checklist.",
  },
  {
    label: "Quick Reference",
    href: "/project-cabinet/quick-links",
    description: "Environment variables, commands, and key links.",
  },
];

const RECENT_COMMITS = [
  {
    hash: "1b32b4b",
    date: "2026-02-22",
    message: "Fix Render runtime by enforcing Node 20 and explicit host/port binding.",
  },
  {
    hash: "c85a9c7",
    date: "2026-02-22",
    message: "Fix web service build/start commands for apps/web rootDir deploys.",
  },
  {
    hash: "7b2fa01",
    date: "2026-02-22",
    message: "Check in local UI/API updates on main.",
  },
];

export default function ProjectCabinetPage() {
  return (
    <main className="app-page min-h-screen text-slate-100">
      <div className="py-4 md:py-6">
        <header className="app-panel relative p-6 md:p-8">
          <Link
            href="/"
            aria-label="Close cabinet"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
          >
            ×
          </Link>
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <Link
                href="/"
                className="app-btn"
              >
                Back Home
              </Link>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Project Cabinet
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                Central place for links, deployment status, and current release context for Diabetes Companion.
              </p>
            </div>

            <div className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-3 text-xs md:ml-auto md:w-[340px] md:text-sm">
              <dl className="grid grid-cols-[110px_1fr] items-center gap-x-3 gap-y-2">
                <dt className="text-slate-400">Status</dt>
                <dd className="font-medium text-emerald-300">Active</dd>

                <dt className="text-slate-400">Release</dt>
                <dd className="font-medium text-sky-300">1.2.8</dd>

                <dt className="text-slate-400">Latest sync</dt>
                <dd className="font-medium text-slate-200">
                  2026-02-22 · <code className="font-mono text-slate-100">1b32b4b</code>
                </dd>
              </dl>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            External Links
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {EXTERNAL_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-600"
              >
                <p className="text-base font-medium">{item.label}</p>
                <p className="mt-1 text-sm text-slate-400">{item.description}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Internal Resources
            </h2>
            <div className="space-y-3">
              {INTERNAL_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-600"
                >
                  <p className="text-base font-medium">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Recent Changes
            </h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <ul className="space-y-4">
                {RECENT_COMMITS.map((commit) => (
                  <li key={commit.hash} className="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <code className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-200">
                        {commit.hash}
                      </code>
                      <span>{commit.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-200">{commit.message}</p>
                  </li>
                ))}
              </ul>
              <a
                href="https://github.com/thatihub/diabetes-companion-v1/commits/main"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm text-sky-300 hover:text-sky-200"
              >
                View full commit history
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
