type TeacherSilhouetteProps = {
  className?: string;
};

export function TeacherSilhouette({ className }: TeacherSilhouetteProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="currentColor"
      focusable="false"
      aria-hidden="true"
    >
      <circle cx="60" cy="38" r="22" />
      <path d="M17 112c0-27 19-45 43-45s43 18 43 45H17Z" />
    </svg>
  );
}
