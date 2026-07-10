import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button, Input, Select, Card } from "../components/ui";
import { useAuth } from "../store/auth";
import { toast } from "../components/toaster";
import logoImg from "../assets/logo.png";
import { Phone, Lock, User, Building, Mail } from "lucide-react";

// const DEMOS = [
//   {
//     phone: "9800000004",
//     pw: "demo1234",
//     label: "🎯 Responder (Command Center)",
//     color: "from-red-500 to-orange-500",
//   },
//   {
//     phone: "9800000002",
//     pw: "demo1234",
//     label: "🤝 Volunteer",
//     color: "from-emerald-500 to-teal-500",
//   },
//   {
//     phone: "9800000001",
//     pw: "demo1234",
//     label: "👤 Citizen",
//     color: "from-blue-500 to-cyan-500",
//   },
//   {
//     phone: "9800000010",
//     pw: "demo1234",
//     label: "🏥 Hospital",
//     color: "from-pink-500 to-rose-500",
//   },
//   {
//     phone: "9800000012",
//     pw: "demo1234",
//     label: "🚒 Fire Department",
//     color: "from-orange-500 to-red-500",
//   },
//   {
//     phone: "9800000014",
//     pw: "demo1234",
//     label: "🏛️ Municipality",
//     color: "from-indigo-500 to-blue-500",
//   },
// ];

const ROLE_OPTIONS = [
  { v: "citizen", l: "👤 Citizen" },
  { v: "volunteer", l: "🤝 Trained Volunteer" },
  { v: "responder", l: "🎯 Emergency Responder" },
  { v: "hospital", l: "🏥 Hospital" },
  { v: "police", l: "🚓 Police" },
  { v: "fire", l: "🚒 Fire Department" },
  { v: "ngo", l: "❤️ NGO" },
  { v: "municipality", l: "🏛️ Municipality" },
];

export default function Auth() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    email: "",
    role: "citizen",
    organization: "",
  });
  const { login, register, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") await login(form.phone, form.password);
      else await register(form);
      toast(mode === "login" ? "Welcome back!" : "Account created!", "ok");
      nav(loc.state?.from || "/app", { replace: true });
    } catch (e) {
      toast(e.response?.data?.detail || "Error", "err");
    }
  };
  // const quick = async (d) => {
  //   setForm((f) => ({ ...f, phone: d.phone, password: d.pw }));
  //   try {
  //     await login(d.phone, d.pw);
  //     toast(`Logged in as ${d.label}`, "ok");
  //     nav("/app", { replace: true });
  //   } catch (e) {
  //     toast(e.response?.data?.detail || "Login failed", "err");
  //   }
  // };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-10">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img
              src={logoImg}
              alt="Aapat Setu"
              className="w-14 h-14 rounded-2xl object-contain shadow-xl shadow-brand-600/30 bg-white p-1"
            />
          </Link>
          <h1 className="text-3xl font-extrabold">
            {mode === "login" ? t("auth.welcome") : t("auth.register")}
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            {mode === "login"
              ? t("auth.subtitle")
              : "Join the Aapat Setu response network"}
          </p>
          <Link
            to="/"
            className="text-xs text-ink-500 hover:text-brand-600 mt-2 inline-block"
          >
            {t("auth.back_home")}
          </Link>
        </div>

        <Card>
          <div className="grid grid-cols-2 gap-1 p-1 mb-5 rounded-xl bg-ink-100 dark:bg-ink-800">
            <button
              onClick={() => setMode("login")}
              className={`py-2 rounded-lg text-sm font-semibold transition-all ${mode === "login" ? "bg-white dark:bg-ink-900 shadow" : ""}`}
            >
              {t("auth.login")}
            </button>
            <button
              onClick={() => setMode("register")}
              className={`py-2 rounded-lg text-sm font-semibold transition-all ${mode === "register" ? "bg-white dark:bg-ink-900 shadow" : ""}`}
            >
              {t("auth.register")}
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-ink-500 mb-1 block">
                    {t("auth.name")}
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                      size={16}
                    />
                    <Input
                      className="pl-9"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-ink-500 mb-1 block">
                      {t("auth.role")}
                    </label>
                    <Select
                      value={form.role}
                      onChange={(e) => set("role", e.target.value)}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.v} value={r.v}>
                          {r.l}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-500 mb-1 block">
                      {t("auth.organization")}
                    </label>
                    <Input
                      placeholder="Optional"
                      value={form.organization}
                      onChange={(e) => set("organization", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-500 mb-1 block">
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                      size={16}
                    />
                    <Input
                      type="email"
                      className="pl-9"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block">
                {t("auth.phone")}
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  size={16}
                />
                <Input
                  className="pl-9"
                  placeholder="e.g. 9800000001"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block">
                {t("auth.password")}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  size={16}
                />
                <Input
                  type="password"
                  className="pl-9"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              {mode === "login" && (
                <div className="text-right mt-1">
                  <a
                    href="#"
                    className="text-xs text-ink-500 hover:text-brand-600"
                  >
                    {t("auth.forgot")}
                  </a>
                </div>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? t("auth.login")
                  : t("auth.register")}
            </Button>
          </form>

          {/* <div className="mt-6 pt-5 border-t border-ink-200 dark:border-ink-800">
            <div className="text-xs text-center text-ink-500 mb-3 font-semibold uppercase tracking-wider">
              {t("auth.demo_accounts")}
            </div>
            <div className="space-y-2">
              {DEMOS.map((d) => (
                <button
                  key={d.phone}
                  onClick={() => quick(d)}
                  className={`w-full p-2.5 rounded-xl text-left bg-gradient-to-r ${d.color} bg-opacity-10 hover:bg-opacity-20 text-white font-semibold text-sm flex items-center justify-between transition-all shadow`}
                >
                  <span>{d.label}</span>
                  <span className="text-xs font-mono opacity-80">
                    {d.phone}
                  </span>
                </button>
              ))}
            </div>
          </div> */}
        </Card>
      </motion.div>
    </div>
  );
}
