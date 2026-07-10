import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cpu,
  Eye,
  Flame,
  Gauge,
  HandHeart,
  Hospital,
  Image as ImageIcon,
  Landmark,
  Languages,
  LockKeyhole,
  Map as MapIcon,
  MapPin,
  Mic,
  Radio,
  Route,
  Send,
  Shield,
  Siren,
  Sparkles,
  UserCog,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

const FEATURE_META = {
  report: {
    icon: Send,
    title: "Fast, guided reporting",
    desc: "Share location, voice, text, and images in one focused emergency flow.",
  },
  ai: {
    icon: Bot,
    title: "AI-assisted triage",
    desc: "Turn incoming reports into concise, structured incident briefings.",
  },
  vision: {
    icon: Eye,
    title: "Visual damage analysis",
    desc: "Identify visible hazards, damage, and response needs from submitted media.",
  },
  map: {
    icon: MapIcon,
    title: "Live operating map",
    desc: "See incidents, teams, hospitals, shelters, and supplies in one shared view.",
  },
  cmd: {
    icon: Gauge,
    title: "Command workspace",
    desc: "Prioritize incidents and coordinate actions without losing context.",
  },
  risk: {
    icon: Cpu,
    title: "Risk intelligence",
    desc: "Surface severity, confidence, urgency, and potential escalation early.",
  },
  resource: {
    icon: Workflow,
    title: "Resource matching",
    desc: "Recommend the closest suitable people, vehicles, facilities, and supplies.",
  },
  alerts: {
    icon: Radio,
    title: "Targeted alerts",
    desc: "Send useful, location-aware instructions instead of broad notification noise.",
  },
  analytics: {
    icon: BarChart3,
    title: "Operational analytics",
    desc: "Understand response times, bottlenecks, demand, and outcomes.",
  },
  realtime: {
    icon: Bell,
    title: "Real-time updates",
    desc: "Keep every authorized role aligned as incident status changes.",
  },
};

const FEATURE_GROUPS = [
  {
    eyebrow: "Capture",
    title: "Clear reports, even under pressure",
    desc: "A short, accessible reporting experience helps people share the information responders need most.",
    tone: "from-red-500/15 to-orange-500/5 text-red-600 dark:text-red-400",
    keys: ["report", "ai", "vision"],
  },
  {
    eyebrow: "Understand",
    title: "One live operating picture",
    desc: "Teams work from the same map, risk signals, updates, and verified incident context.",
    tone: "from-blue-500/15 to-cyan-500/5 text-blue-600 dark:text-blue-400",
    keys: ["map", "cmd", "risk", "realtime"],
  },
  {
    eyebrow: "Respond",
    title: "Coordinate the right response",
    desc: "Route alerts, tasks, resources, and decisions to the people who can act.",
    tone: "from-emerald-500/15 to-teal-500/5 text-emerald-600 dark:text-emerald-400",
    keys: ["resource", "alerts", "analytics"],
  },
];

const ROLE_META = {
  citizen: {
    icon: Users,
    name: "Citizen",
    desc: "Report incidents, receive verified guidance, and follow local updates.",
    tone: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  },
  volunteer: {
    icon: HandHeart,
    name: "Volunteer",
    desc: "Discover verified needs and coordinate safe community support.",
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  responder: {
    icon: Shield,
    name: "Responder",
    desc: "Receive assignments, routes, context, and live incident updates.",
    tone: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  },
  hospital: {
    icon: Hospital,
    name: "Hospital",
    desc: "Share capacity and prepare teams before patients arrive.",
    tone: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300",
  },
  police: {
    icon: Landmark,
    name: "Police",
    desc: "Coordinate public safety, access control, and field verification.",
    tone: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  },
  fire: {
    icon: Flame,
    name: "Fire service",
    desc: "See hazard context, routes, and nearby support resources.",
    tone: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
  },
  ngo: {
    icon: HandHeart,
    name: "NGO",
    desc: "Coordinate relief, shelter, supplies, and community assistance.",
    tone: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  },
  municipality: {
    icon: Building2,
    name: "Municipality",
    desc: "Maintain a local operating picture and coordinate public services.",
    tone: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  },
  admin: {
    icon: UserCog,
    name: "Administrator",
    desc: "Manage access, workflows, data quality, and system oversight.",
    tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

const WORKFLOW_FALLBACK = [
  {
    title: "Report",
    desc: "A person shares the location, situation, media, and immediate needs.",
  },
  {
    title: "Triage",
    desc: "AI structures the report while authorized teams verify urgency and context.",
  },
  {
    title: "Coordinate",
    desc: "The platform recommends resources, alerts relevant roles, and creates tasks.",
  },
  {
    title: "Respond",
    desc: "Teams act with live routes and updates, then close the loop with outcomes.",
  },
];

const BENEFITS_FALLBACK = [
  {
    title: "Faster shared awareness",
    desc: "Replace fragmented calls and messages with one current incident record.",
  },
  {
    title: "Better prioritization",
    desc: "Help teams focus on urgent, high-impact situations first.",
  },
  {
    title: "Less coordination friction",
    desc: "Give every authorized role the context needed to act confidently.",
  },
  {
    title: "Safer public guidance",
    desc: "Deliver verified, location-aware instructions during uncertain events.",
  },
  {
    title: "More accountable response",
    desc: "Track decisions, assignments, status changes, and outcomes.",
  },
  {
    title: "Stronger preparedness",
    desc: "Use operational data to improve plans, coverage, and resource placement.",
  },
];

const FUTURE_FALLBACK = [
  "Offline-first emergency reporting",
  "Cell-broadcast and SMS alert delivery",
  "Predictive hazard and demand modeling",
  "Drone and IoT sensor integrations",
  "Regional mutual-aid coordination",
  "Open standards for agency interoperability",
];

const AI_CAPABILITIES = [
  {
    icon: Mic,
    text: "Speech-to-text, language detection, and Nepali translation",
  },
  {
    icon: ImageIcon,
    text: "Image analysis for visible fire, flood, damage, and hazards",
  },
  { icon: Brain, text: "Severity, confidence, urgency, and risk scoring" },
  { icon: Workflow, text: "Resource and responder recommendations" },
  { icon: Languages, text: "English and Nepali operational summaries" },
  {
    icon: Eye,
    text: "Potential duplicate detection using place and report similarity",
  },
];

function Reveal({ children, className = "", delay = 0, y = 18 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionIntro({ eyebrow, title, sub, align = "center", id }) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
        {eyebrow}
      </div>
      <h2
        id={id}
        className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white"
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
          {sub}
        </p>
      )}
    </div>
  );
}

function PrimaryLink({ to, children, className = "" }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 ${className}`}
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ to, children, className = "" }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950 ${className}`}
    >
      {children}
    </Link>
  );
}

function PreviewPin({ top, left, severity = "critical", label }) {
  const colors = {
    critical: "bg-red-500 shadow-red-500/35",
    high: "bg-orange-500 shadow-orange-500/35",
    moderate: "bg-amber-500 shadow-amber-500/35",
    low: "bg-emerald-500 shadow-emerald-500/35",
  };

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full"
      style={{ top, left }}
      aria-label={label}
    >
      {severity === "critical" && (
        <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-red-500/25" />
      )}
      <span
        className={`relative grid h-9 w-9 place-items-center rounded-full border-[3px] border-white text-white shadow-lg ${colors[severity]}`}
      >
        {severity === "low" ? (
          <Check size={16} strokeWidth={3} />
        ) : (
          <AlertTriangle size={15} strokeWidth={2.5} />
        )}
      </span>
      <span
        className={`mx-auto -mt-1.5 block h-3 w-3 rotate-45 border-b-2 border-r-2 border-white ${colors[severity].split(" ")[0]}`}
      />
    </div>
  );
}

function CommandCenterPreview() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-700/70 bg-slate-950 text-white shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
            <Shield size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">
              Emergency operations
            </div>
            <div className="text-[10px] font-semibold text-slate-400">
              Kathmandu command view
            </div>
          </div>
        </div>
        <div className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.12)]" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
        {[
          {
            value: "03",
            label: "Critical",
            color: "text-red-400",
            icon: Siren,
          },
          {
            value: "12",
            label: "Active",
            color: "text-amber-300",
            icon: Activity,
          },
          {
            value: "47",
            label: "Resolved",
            color: "text-emerald-300",
            icon: CheckCircle2,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/[0.045] p-2.5 sm:p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <strong
                  className={`text-xl font-black sm:text-2xl ${stat.color}`}
                >
                  {stat.value}
                </strong>
                <Icon size={14} className="hidden text-slate-500 sm:block" />
              </div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div
          className="relative h-[310px] overflow-hidden rounded-2xl border border-white/10 bg-[#111f32]"
          role="img"
          aria-label="Illustration of a live emergency operations map"
        >
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.12) 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <svg
            viewBox="0 0 600 310"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path
              d="M-20 218C82 177 116 231 207 190s130-22 178-72S493 72 626 95"
              fill="none"
              stroke="#26384e"
              strokeWidth="28"
            />
            <path
              d="M-20 218C82 177 116 231 207 190s130-22 178-72S493 72 626 95"
              fill="none"
              stroke="#475569"
              strokeWidth="3"
              strokeDasharray="8 8"
              opacity=".7"
            />
            <path
              d="M122-20c28 80 7 139 55 189s74 82 74 165"
              fill="none"
              stroke="#26384e"
              strokeWidth="22"
            />
            <path
              d="M122-20c28 80 7 139 55 189s74 82 74 165"
              fill="none"
              stroke="#475569"
              strokeWidth="2.5"
              strokeDasharray="7 8"
              opacity=".65"
            />
            <path
              d="M449-10c-37 75-13 120-61 176s-92 76-106 154"
              fill="none"
              stroke="#26384e"
              strokeWidth="18"
            />
            <path
              d="M449-10c-37 75-13 120-61 176s-92 76-106 154"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="6 8"
              opacity=".65"
            />
            <path
              d="M82 76c97 33 158 3 225 35s117 94 228 98"
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M82 76c97 33 158 3 225 35s117 94 228 98"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeDasharray="1 9"
              strokeLinecap="round"
            />
          </svg>

          <PreviewPin
            top="31%"
            left="28%"
            severity="critical"
            label="Critical incident"
          />
          <PreviewPin
            top="55%"
            left="58%"
            severity="high"
            label="High-severity incident"
          />
          <PreviewPin
            top="42%"
            left="78%"
            severity="moderate"
            label="Moderate incident"
          />
          <PreviewPin
            top="72%"
            left="35%"
            severity="low"
            label="Resolved incident"
          />

          <div
            className="absolute right-[8%] top-[13%] grid h-9 w-9 place-items-center rounded-xl border-2 border-white bg-pink-600 text-white shadow-lg"
            aria-label="Hospital"
          >
            <Hospital size={16} />
          </div>
          <div
            className="absolute bottom-[24%] left-[9%] grid h-9 w-9 place-items-center rounded-xl border-2 border-white bg-blue-600 text-white shadow-lg"
            aria-label="Response unit"
          >
            <Ambulance size={16} />
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 rounded-xl border border-white/10 bg-slate-950/90 p-2.5 shadow-xl backdrop-blur-md">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-500/20 text-violet-300">
              <Sparkles size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-extrabold">
                AI triage complete
              </div>
              <div className="truncate text-[9px] text-slate-400">
                Flood · Critical · 3 units recommended
              </div>
            </div>
            <div className="shrink-0 rounded-md bg-emerald-400/10 px-2 py-1 text-[9px] font-black text-emerald-300">
              ETA 4m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const tr = (key, fallback) => {
    const value = t(key, { defaultValue: fallback });
    return typeof value === "string" ? value : fallback;
  };

  const translatedList = (key, fallback) => {
    const value = t(key, { returnObjects: true, defaultValue: fallback });
    return Array.isArray(value) ? value : fallback;
  };

  const workflow = translatedList("workflow.steps", WORKFLOW_FALLBACK);
  const benefits = translatedList("benefits.items", BENEFITS_FALLBACK);
  const futureItems = translatedList("future.items", FUTURE_FALLBACK);
  const roles = Object.keys(ROLE_META);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950 selection:bg-red-200 selection:text-red-950 dark:bg-slate-950 dark:text-white">
      <main>
        <section className="relative isolate overflow-hidden pb-20 pt-16 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28">
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,#f8fafc,white_62%)] dark:bg-[linear-gradient(to_bottom,#020617,#020617)]" />
          <div
            className="absolute inset-0 -z-10 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)] dark:opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(100,116,139,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(100,116,139,.14) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute -left-48 top-10 -z-10 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/10"
            aria-hidden="true"
          />
          <div
            className="absolute -right-48 top-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-red-400/15 blur-3xl dark:bg-red-500/10"
            aria-hidden="true"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:px-8">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {tr("hero.pill_live", "Live emergency coordination network")}
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
                {tr("hero.title", "Faster decisions.")}{" "}
                <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {tr("hero.title_gradient", "Safer communities.")}
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
                {tr(
                  "hero.subtitle",
                  "Bring citizens, responders, hospitals, municipalities, and relief teams into one trusted operating picture—from the first report to the final update.",
                )}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryLink to="/app/report" className="sm:min-w-[190px]">
                  <AlertTriangle size={18} aria-hidden="true" />
                  {tr("hero.cta_report", "Report an emergency")}
                </PrimaryLink>
                <SecondaryLink to="/app/login" className="sm:min-w-[170px]">
                  {tr("hero.cta_app", "Open platform")}
                  <ArrowRight size={18} aria-hidden="true" />
                </SecondaryLink>
              </div>

              <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  { icon: MapPin, text: "Location-aware reporting" },
                  { icon: Brain, text: "AI-assisted triage" },
                  { icon: LockKeyhole, text: "Role-based coordination" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.text}
                      className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Icon size={14} aria-hidden="true" />
                      </span>
                      {item.text}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={
                reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }
              }
              animate={
                reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
              }
              transition={{
                duration: 0.75,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >
              <div
                className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-500/15 via-transparent to-red-500/20 blur-2xl"
                aria-hidden="true"
              />
              <CommandCenterPreview />
            </motion.div>
          </div>
        </section>

        <section
          className="border-y border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40"
          aria-label="Platform summary"
        >
          <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8 dark:divide-slate-800">
            {[
              { value: "9", label: "connected operational roles", icon: Users },
              {
                value: "6",
                label: "AI-assisted intelligence workflows",
                icon: Sparkles,
              },
              {
                value: "1",
                label: "shared, live operating picture",
                icon: Activity,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-center gap-4 px-4 py-6 sm:py-7"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-blue-400 dark:ring-slate-800">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <strong className="block text-2xl font-black text-slate-950 dark:text-white">
                      {item.value}
                    </strong>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="problem"
          aria-labelledby="problem-title"
          className="py-20 sm:py-24"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-8">
            <Reveal>
              <SectionIntro
                id="problem-title"
                align="left"
                eyebrow={tr("problem.eyebrow", "The response gap")}
                title={tr(
                  "problem.title",
                  "Emergencies move faster than fragmented information.",
                )}
                sub={tr(
                  "problem.sub",
                  "When reports, locations, decisions, and resources live in separate channels, teams lose time rebuilding the same picture.",
                )}
              />
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-xl shadow-red-950/5 sm:p-8 dark:border-red-500/20 dark:from-red-500/10 dark:to-orange-500/5">
                <div
                  className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-red-500/10 blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
                    <AlertTriangle size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-red-950 dark:text-red-200">
                      {tr(
                        "problem.banner_title",
                        "Every handoff can become a delay.",
                      )}
                    </h3>
                    <p className="mt-2 leading-7 text-red-900/75 dark:text-red-200/75">
                      {tr(
                        "problem.banner_body",
                        "Crisis response needs a shared source of truth that turns public reports into coordinated, accountable action without overwhelming the people using it.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    "Scattered reports",
                    "Unclear priorities",
                    "Duplicated effort",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-red-200/80 bg-white/65 px-3 py-3 text-xs font-bold text-red-900 backdrop-blur dark:border-red-500/20 dark:bg-slate-950/25 dark:text-red-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="features"
          aria-labelledby="features-title"
          className="border-y border-slate-200 bg-slate-50/70 py-20 sm:py-24 dark:border-slate-800 dark:bg-slate-900/30"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <Reveal>
              <SectionIntro
                id="features-title"
                eyebrow={tr("solution.eyebrow", "One coordinated system")}
                title={tr(
                  "solution.title",
                  "Designed around the decisions people need to make.",
                )}
                sub={tr(
                  "solution.sub",
                  "The experience is organized into three clear jobs: capture the right information, understand the situation, and coordinate a response.",
                )}
              />
            </Reveal>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {FEATURE_GROUPS.map((group, groupIndex) => (
                <Reveal
                  key={group.title}
                  delay={groupIndex * 0.07}
                  className="h-full"
                >
                  <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div
                      className={`rounded-2xl bg-gradient-to-br p-4 ${group.tone}`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] opacity-80">
                        {group.eyebrow}
                      </div>
                      <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                        {group.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {group.desc}
                      </p>
                    </div>

                    <div className="mt-3 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                      {group.keys.map((key) => {
                        const feature = FEATURE_META[key];
                        const Icon = feature.icon;
                        return (
                          <div
                            key={key}
                            className="flex gap-3 py-4 first:pt-2 last:pb-1"
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <Icon size={17} aria-hidden="true" />
                            </span>
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {tr(`features.${key}.title`, feature.title)}
                              </h4>
                              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {tr(`features.${key}.desc`, feature.desc)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="workflow"
          aria-labelledby="workflow-title"
          className="py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <Reveal>
              <SectionIntro
                id="workflow-title"
                eyebrow={tr("workflow.eyebrow", "From signal to action")}
                title={tr(
                  "workflow.title",
                  "A response flow that stays understandable.",
                )}
                sub="Every stage has a clear owner, useful context, and a visible next action."
              />
            </Reveal>

            <div className="relative mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div
                className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-gradient-to-r from-red-300 via-blue-300 to-emerald-300 lg:block dark:from-red-500/40 dark:via-blue-500/40 dark:to-emerald-500/40"
                aria-hidden="true"
              />
              {workflow.slice(0, 4).map((step, index) => (
                <Reveal
                  key={`${step.title}-${index}`}
                  delay={index * 0.07}
                  className="relative"
                >
                  <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-slate-950 text-xl font-black text-white shadow-lg dark:border-slate-950 dark:bg-blue-600">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-950 dark:text-white">
                        {step.title}
                      </h3>
                      {index > 0 && (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                          AI assisted
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {step.desc}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="roles"
          aria-labelledby="roles-title"
          className="border-y border-slate-200 bg-slate-950 py-20 text-white sm:py-24 dark:border-slate-800"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
                <SectionIntro
                  id="roles-title"
                  align="left"
                  eyebrow={tr("roles.eyebrow", "Connected roles")}
                  title={tr("roles.title", "One network, purpose-built views.")}
                  sub="People see the same incident truth, but each role gets the tools and actions relevant to its responsibility."
                />
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  <LockKeyhole
                    className="mt-0.5 shrink-0 text-blue-400"
                    size={18}
                    aria-hidden="true"
                  />
                  Role-based access keeps sensitive operational details with
                  authorized teams while preserving clear public guidance.
                </div>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role, index) => {
                const meta = ROLE_META[role];
                const Icon = meta.icon;
                return (
                  <Reveal key={role} delay={(index % 3) * 0.04}>
                    <article className="group flex h-full gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-white/20 hover:bg-white/[0.075]">
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${meta.tone}`}
                      >
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-extrabold text-white">
                          {tr(`roles.${role}.name`, meta.name)}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {tr(`roles.${role}.desc`, meta.desc)}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="ai-title"
          className="relative overflow-hidden py-20 sm:py-24"
        >
          <div
            className="absolute left-1/2 top-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1fr_.95fr] lg:px-8">
            <Reveal>
              <SectionIntro
                id="ai-title"
                align="left"
                eyebrow="AI intelligence engine"
                title="Useful automation, with people in control."
                sub="AI reduces the time spent reading, translating, and structuring incoming information. Authorized teams still verify reports and make operational decisions."
              />

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {AI_CAPABILITIES.map((capability) => {
                  const Icon = capability.icon;
                  return (
                    <div
                      key={capability.text}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                        <Icon size={15} aria-hidden="true" />
                      </span>
                      <span className="text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
                        {capability.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-500/20">
                      <Bot size={18} />
                    </span>
                    <div>
                      <div className="text-sm font-black">
                        AI incident briefing
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Awaiting human verification
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-300">
                    Draft
                  </span>
                </div>

                <div className="p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Incident", value: "Urban flood" },
                      {
                        label: "Severity",
                        value: "Critical · 92%",
                        accent: "text-red-400",
                      },
                      { label: "People at risk", value: "8–15 estimated" },
                      {
                        label: "Nearest unit",
                        value: "4 min ETA",
                        accent: "text-emerald-300",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                      >
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {item.label}
                        </div>
                        <div
                          className={`mt-1 text-sm font-extrabold ${item.accent || "text-white"}`}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Recommended resources
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        "Rescue boat",
                        "Ambulance",
                        "Police",
                        "Shelter",
                        "Water",
                      ].map((resource) => (
                        <span
                          key={resource}
                          className="rounded-lg bg-white/[0.07] px-2.5 py-1.5 text-[10px] font-bold text-slate-200"
                        >
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-400/15 bg-blue-400/[0.07] p-4">
                    <Shield
                      className="mt-0.5 shrink-0 text-blue-300"
                      size={17}
                    />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                        Suggested public guidance
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        Move to higher ground. Avoid walking or driving through
                        floodwater. Follow verified local instructions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="benefits"
          aria-labelledby="benefits-title"
          className="border-y border-slate-200 bg-slate-50/70 py-20 sm:py-24 dark:border-slate-800 dark:bg-slate-900/30"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <Reveal>
              <SectionIntro
                id="benefits-title"
                eyebrow={tr("benefits.eyebrow", "Operational value")}
                title={tr(
                  "benefits.title",
                  "Better coordination at every level.",
                )}
                sub="A calmer interface, clearer ownership, and shared context help teams spend more time responding and less time reconstructing information."
              />
            </Reveal>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {benefits.slice(0, 6).map((benefit, index) => (
                <Reveal
                  key={`${benefit.title}-${index}`}
                  delay={(index % 3) * 0.05}
                >
                  <article className="flex h-full gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-emerald-500"
                      size={21}
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-950 dark:text-white">
                        {benefit.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {benefit.desc}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="future"
          aria-labelledby="future-title"
          className="py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[.8fr_1.2fr] lg:p-10">
                <Reveal>
                  <SectionIntro
                    id="future-title"
                    align="left"
                    eyebrow={tr("future.eyebrow", "Built to evolve")}
                    title={tr(
                      "future.title",
                      "A practical path toward stronger resilience.",
                    )}
                    sub="Start with a clear coordination foundation, then connect additional channels and intelligence as operations mature."
                  />
                </Reveal>

                <div className="grid content-start gap-3 sm:grid-cols-2">
                  {futureItems.slice(0, 6).map((item, index) => (
                    <Reveal key={`${item}-${index}`} delay={(index % 2) * 0.04}>
                      <div className="flex min-h-14 items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:ring-slate-800">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                          <Zap size={15} aria-hidden="true" />
                        </span>
                        {item}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20 sm:pb-24" aria-labelledby="cta-title">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <Reveal>
              <div className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-16">
                <div
                  className="absolute -left-28 -top-28 -z-10 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-32 -right-24 -z-10 h-80 w-80 rounded-full bg-red-500/25 blur-3xl"
                  aria-hidden="true"
                />
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/25">
                  <Siren size={25} aria-hidden="true" />
                </div>
                <h2
                  id="cta-title"
                  className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl"
                >
                  Ready to close the response gap?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
                  Report an emergency now, or open the platform to explore the
                  coordinated response experience.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <PrimaryLink to="/app/report">
                    <AlertTriangle size={18} />
                    Report emergency
                  </PrimaryLink>
                  <Link
                    to="/app/login"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
                  >
                    Launch platform
                    <ChevronRight size={18} />
                  </Link>
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={13} className="text-emerald-400" /> Guided
                    reporting
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Route size={13} className="text-emerald-400" /> Live
                    routing
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={13} className="text-emerald-400" /> Real-time
                    status
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-600/15">
              <Shield size={18} aria-hidden="true" />
            </span>
            <div>
              <div className="font-black text-slate-950 dark:text-white">
                {tr("brand", "Crisis Response Network")}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {tr("footer.tagline", "From report to coordinated action.")}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            {tr(
              "footer.made_by",
              "Built for safer, more resilient communities.",
            )}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300">
            <Languages size={14} aria-hidden="true" />
            EN · ने
          </div>
        </div>
      </footer>
    </div>
  );
}
