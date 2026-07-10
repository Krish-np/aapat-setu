import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";
import {
  Card,
  Button,
  Badge,
  Input,
  priorityBadge,
  statusBadge,
  Skeleton,
  EmptyState,
} from "../components/ui";
import PageHeader from "../components/PageHeader";
import useRelativeTime from "../lib/useRelativeTime";
import { useTranslation } from "react-i18next";
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

const LABELS = {
  all: "All",
  submitted: "Submitted",
  verified: "Verified",
  assigned: "Assigned",
  dispatched: "Dispatched",
  en_route: "En Route",
  on_site: "On Scene",
  rescue_ongoing: "Rescue",
  resolved: "Resolved",
};

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg">
      <div className="divide-y divide-ink-100 dark:divide-ink-800">
        <div className="flex gap-4 p-3 bg-ink-50/60 dark:bg-ink-900/30">
          {[
            "w-10",
            "w-24",
            "flex-1",
            "w-20",
            "w-20",
            "w-10",
            "w-16",
            "w-24",
          ].map((className, index) => (
            <Skeleton key={index} className={`h-3 ${className}`} />
          ))}
        </div>

        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex gap-4 p-3 items-center">
            {[
              "w-10",
              "w-24",
              "flex-1",
              "w-20",
              "w-20",
              "w-10",
              "w-16",
              "w-24",
            ].map((className, index) => (
              <Skeleton key={index} className={`h-4 ${className}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Incidents() {
  const { t } = useTranslation();
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
      .then((response) => setIncs(response.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    await api.patch(`/api/incidents/${id}`, { status });
    load();
  };

  const filtered = incs.filter((incident) => {
    if (!q) return true;

    const haystack =
      `${incident.ai_summary || ""} ${incident.description || ""} ${incident.incident_type || ""}`.toLowerCase();
    return haystack.includes(q.toLowerCase());
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

  return (
    <div>
      <PageHeader
        icon={AlertTriangle}
        iconColor="text-red-500"
        title={t("incidents.title", "Incident Command")}
        subtitle={
          loading
            ? t("incidents.subtitle_loading", "Loading incidents…")
            : `${filtered.length} ${t("incidents.subtitle", "incidents · monitor, verify, and dispatch")}`
        }
        actions={
          <Link to="/app/report">
            <Button size="sm">
              <Plus size={15} /> {t("incidents.new_report", "New Report")}
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-4 !p-4 !pb-0">
          <div className="flex-1 min-w-[220px]">
            <Input
              icon={<Search size={15} />}
              placeholder={t("incidents.search", "Search incidents…")}
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="h-9"
            />
          </div>

          <div className="flex gap-1 flex-wrap rounded-lg bg-ink-100 dark:bg-ink-800 p-1">
            {STATUSES.map((status) => (
              <motion.button
                key={status}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(status)}
                className={
                  "h-7 px-2.5 rounded-md text-[12px] font-semibold capitalize transition " +
                  (filter === status
                    ? "bg-white dark:bg-ink-950 shadow text-brand-600 dark:text-brand-300"
                    : "text-ink-600 dark:text-ink-300")
                }
              >
                {LABELS[status] || status.replaceAll("_", " ")}
              </motion.button>
            ))}
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
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
                  <Plus size={14} />{" "}
                  {t("incidents.report_incident", "Report Incident")}
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 border-b border-ink-200 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-900/20">
                  <th className="py-2.5 px-4 font-semibold">S.No.</th>
                  <th className="py-2.5 px-2 font-semibold">Type</th>
                  <th className="py-2.5 px-2 font-semibold min-w-[200px]">
                    Summary
                  </th>
                  <th className="py-2.5 px-2 font-semibold">Priority</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 px-2 font-semibold">ETA</th>
                  <th className="py-2.5 px-2 font-semibold">Reported</th>
                  <th className="py-2.5 px-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((incident, index) => {
                  const priority = priorityBadge(
                    incident.ai_severity || incident.severity,
                  );
                  const status = statusBadge(incident.status);

                  return (
                    <Row
                      key={incident.id}
                      sno={index + 1}
                      i={incident}
                      pb={priority}
                      sb={status}
                      canAdvance={canAdvance}
                      setStatus={setStatus}
                    />
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

function Row({ i, sno, pb, sb, canAdvance, setStatus }) {
  const when = useRelativeTime(i.created_at);

  return (
    <tr className="border-b border-ink-100 dark:border-ink-800/60 hover:bg-ink-50/70 dark:hover:bg-ink-800/30 transition-colors">
      <td className="py-2.5 px-4 font-mono text-xs text-ink-500">{sno}</td>

      <td className="py-2.5 px-2">
        <span className="capitalize font-semibold text-ink-900 dark:text-white whitespace-nowrap">
          {(i.incident_type || "").replaceAll("_", " ")}
        </span>
      </td>

      <td className="py-2.5 px-2 max-w-md">
        <Link
          to={`/app/incidents/${i.id}`}
          className="text-ink-700 dark:text-ink-200 hover:text-brand-600 dark:hover:text-brand-400 line-clamp-2"
        >
          {i.ai_summary || (i.description || "").slice(0, 120)}
        </Link>
      </td>

      <td className="py-2.5 px-2">
        <Badge color={pb.color} dot={pb.color === "red"}>
          {pb.label}
        </Badge>
      </td>

      <td className="py-2.5 px-2">
        <Badge color={sb.color}>{sb.label.replaceAll("_", " ")}</Badge>
      </td>

      <td className="py-2.5 px-2 text-ink-600 dark:text-ink-300 text-xs tabular-nums">
        {i.ai_response_time_min || i.eta_minutes || "—"}m
      </td>

      <td className="py-2.5 px-2 text-xs text-ink-500 whitespace-nowrap tabular-nums">
        {when}
      </td>

      <td className="py-2.5 px-4">
        <div className="flex gap-1.5 justify-end">
          {canAdvance[i.status] && (
            <Button
              size="xs"
              onClick={() => setStatus(i.id, canAdvance[i.status])}
            >
              {canAdvance[i.status].replace("_", " ")}
            </Button>
          )}

          <Link to={`/app/incidents/${i.id}`}>
            <Button size="xs" variant="ghost">
              Open <ChevronRight size={13} />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
}
