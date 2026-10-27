"use client";

export default function ConfirmDelete() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Delete this row? This cannot be undone.")) e.preventDefault();
      }}
      className="btn btn-ghost"
      style={{ color: "var(--bad)" }}
    >
      $ delete
    </button>
  );
}