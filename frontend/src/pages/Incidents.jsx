import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import {
  Card,
  Button,
  Badge,
  Input,
  priorityBadge,
  statusBadge,
  SkeletonTable,
  EmptyState,
} from "../components/ui";
import { timeAgo } from "../lib/helpers";
import { Search, AlertTriangle, Plus, ChevronRight } from "lucide-react";

const STATUSES = [
  "all",
  "submitted",
  "verified",
  "assigned",
  "dispatched",
  "en_route",
  "on_site",
  "rescue_ongoing",
  "resolved",
];

export default function Incidents() {
  const [incs, setIncs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/api/incidents", {
        params: filter !== "all" ? { status: filter } : {},
      })
      .then((r) => setIncs(r.data))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    await api.patch(`/api/incidents/${id}`, { status });
    load();
  };

  const filtered = incs.filter((i) => {
    if (!q) return true;
    const hay =
      `${i.ai_summary || ""} ${i.description || ""} ${i.incident_type || ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const canAdvance = {
    submitted: "verified",
    verified: "assigned",
    assigned: "dispatched",
    dispatched: "en_route",
    en_route: "on_site",
    on_site: "rescue_ongoing",
    rescue_ongoing: "resolved",
  };

  const labelForNext = (s) =>
    ({
      verified: "Verify",
    })[s] || s.replace("_", " ");

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} /> Incident
            Command
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
            {loading
              ? "Loading incidents…"
              : `${filtered.length} incidents · monitor, verify, and dispatch`}
          </p>
        </div>
        <Link to="/app/report">
          <Button>
            <Plus size={16} /> New Report
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-[220px]">
            <Input
              icon={<Search size={16} />}
              placeholder="Search incidents…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  "h-8 px-3 rounded-lg text-xs font-semibold capitalize transition-all",
                  filter === f
                    ? "bg-brand-600 text-white shadow-sm shadow-brand-600/25"
                    : "bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700",
                ].join(" ")}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonTable cols={7} rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle size={28} />}
            title={
              q ? "No incidents match your search" : "No incidents in this view"
            }
            description="Try a different filter or clear your search."
            action={
              <Link to="/app/report">
                <Button size="sm">
                  <Plus size={14} /> Report Incident
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 border-b border-ink-200 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-900/30">
                  <th className="py-3 px-5 font-semibold">ID</th>
                  <th className="py-3 px-2 font-semibold">Type</th>
                  <th className="py-3 px-2 font-semibold min-w-[240px]">
                    Summary
                  </th>
                  <th className="py-3 px-2 font-semibold">Priority</th>
                  <th className="py-3 px-2 font-semibold">Status</th>
                  <th className="py-3 px-2 font-semibold">ETA</th>
                  <th className="py-3 px-2 font-semibold">Reported</th>
                  <th className="py-3 px-5 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const pb = priorityBadge(i.ai_severity || i.severity);
                  const sb = statusBadge(i.status);
                  return (
                    <tr
                      key={i.id}
                      className="border-b border-ink-100 dark:border-ink-800/60 hover:bg-ink-50/70 dark:hover:bg-ink-800/40 transition-colors"
                    >
                      <td className="py-3 px-5 font-mono text-xs text-ink-500">
                        #{i.id.toString().padStart(4, "0")}
                      </td>
                      <td className="py-3 px-2">
                        <span className="capitalize font-semibold text-ink-900 dark:text-white">
                          {i.incident_type?.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-2 max-w-md">
                        <Link
                          to={`/app/incidents/${i.id}`}
                          className="text-ink-700 dark:text-ink-200 hover:text-brand-600 dark:hover:text-brand-400 line-clamp-2"
                        >
                          {i.ai_summary || i.description?.slice(0, 120)}
                        </Link>
                        {i.ai_duplicate_of && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            ⚠ Possible duplicate of #{i.ai_duplicate_of}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Badge color={pb.color} dot={pb.color === "red"}>
                          {pb.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge color={sb.color}>
                          {sb.label.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-ink-600 dark:text-ink-300 text-xs">
                        {i.eta_minutes}m
                      </td>
                      <td className="py-3 px-2 text-xs text-ink-500 whitespace-nowrap">
                        {timeAgo(i.created_at)}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex gap-1.5 justify-end">
                          {canAdvance[i.status] && (
                            <Button
                              size="sm"
                              onClick={() =>
                                setStatus(i.id, canAdvance[i.status])
                              }
                            >
                              {labelForNext(canAdvance[i.status])}
                            </Button>
                          )}
                          <Link to={`/app/incidents/${i.id}`}>
                            <Button size="sm" variant="ghost">
                              Open <ChevronRight size={14} />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
