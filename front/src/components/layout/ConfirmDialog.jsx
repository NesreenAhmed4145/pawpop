import { useEffect } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

// نافذة تأكيد قابلة لإعادة الاستخدام (حذف حيوان، إلخ)
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  error = "",
  onConfirm,
  onCancel,
}) {
  // Esc للإغلاق + منع سكرول الصفحة وقت فتح النافذة
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !loading && onCancel?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={() => !loading && onCancel?.()}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-2xl border border-edge bg-white p-7 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-bg text-danger">
          <AlertTriangle size={30} />
        </span>

        <h2 id="confirm-title" className="mt-5 text-xl font-bold text-text-heading">
          {title}
        </h2>
        {message && <p className="mt-2 text-sm leading-6 text-text-body">{message}</p>}

        {error && (
          <p className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">{error}</p>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-full border border-edge bg-white px-5 py-3 text-sm font-semibold text-text-body transition hover:bg-sand-soft disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-danger px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
