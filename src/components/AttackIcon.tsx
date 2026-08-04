type AttackIconProps = {
  className?: string;
};

export function AttackIcon({ className = '' }: AttackIconProps) {
  return (
    <svg
      className={`attack-icon ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="7" />
      <path d="M12 1v5M12 18v5M1 12h5M18 12h5M7 17 17 7" />
      <path d="m14 7 3-1-1 3" />
    </svg>
  );
}
