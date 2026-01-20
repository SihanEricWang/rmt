// components/ui/ConfirmDeleteButton.tsx
"use client";

export default function ConfirmDeleteButton({
  children,
  className,
  confirmText = "Are you sure you want to delete this rating? This cannot be undone.",
}: {
  children: React.ReactNode;
  className?: string;
  confirmText?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
