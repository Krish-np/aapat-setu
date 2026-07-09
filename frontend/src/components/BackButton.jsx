import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ to, label = "Back" }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors h-9 px-2 -ml-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
