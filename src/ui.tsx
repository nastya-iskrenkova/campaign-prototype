import { useEffect, useState, type ReactNode } from "react";

const iconSize = {
  tag: [40, 40],
  "search-sm": [20, 20],
  "chevron-right": [20, 20],
  grid: [20, 20],
  "chevron-left": [20, 20],
  search: [20, 20],
  "radio-on": [24, 24],
  "chevron-down": [16, 16],
  pencil: [16, 16],
  question: [16, 16],
  check: [20, 20],
  graph: [20, 20],
  wallet: [24, 24],
  xmark: [24, 24],
} as const;

export type IconName = keyof typeof iconSize;

export function Icon({ name, alt = "" }: { name: IconName; alt?: string }) {
  const [width, height] = iconSize[name];
  return <img className="icon" src={`/assets/${name}.svg`} width={width} height={height} alt={alt} />;
}

export function StatusBar() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatTime(new Date())), 15000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="status">
      <span className="status-time">{time}</span>
      <span className="status-icons" aria-hidden>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="7" width="3" height="4" rx="0.6" fill="#000" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.6" fill="#000" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.6" fill="#000" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.6" fill="#000" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 12" fill="none">
          <path d="M8 3.2C9.7 3.2 11.2 3.9 12.3 5L13.5 3.7C12 2.2 10.1 1.3 8 1.3C5.9 1.3 4 2.2 2.5 3.7L3.7 5C4.8 3.9 6.3 3.2 8 3.2Z" fill="#000" />
          <path d="M8 6.3C9 6.3 9.9 6.7 10.6 7.4L11.8 6.1C10.8 5.1 9.5 4.5 8 4.5C6.5 4.5 5.2 5.1 4.2 6.1L5.4 7.4C6.1 6.7 7 6.3 8 6.3Z" fill="#000" />
          <circle cx="8" cy="10" r="1.4" fill="#000" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#000" />
          <rect x="2" y="2" width="16" height="8" rx="1" fill="#000" />
          <path d="M23 4.2V7.8C23.8 7.4 24.2 6.8 24.2 6C24.2 5.2 23.8 4.6 23 4.2Z" fill="#000" />
        </svg>
      </span>
    </div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function NavBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="nav">
      {onBack ? (
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Назад">
          <Icon name="chevron-left" alt="" />
        </button>
      ) : (
        <span />
      )}
      <h1>{title}</h1>
      <span />
    </div>
  );
}

export function HomeIndicator() {
  return (
    <div className="home" aria-hidden>
      <i />
    </div>
  );
}

const steps = [
  { id: 1 as const, label: "Товар" },
  { id: 2 as const, label: "Ставки" },
  { id: 3 as const, label: "Бюджет" },
];

export function Stepper({
  current,
  onJump,
}: {
  current: 1 | 2 | 3;
  onJump?: (step: 1 | 2 | 3) => void;
}) {
  return (
    <div className="stepper">
      {steps.map((step) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <button
            key={step.id}
            type="button"
            className={`step${active ? " active" : ""}${done ? " done" : ""}`}
            disabled={!done}
            onClick={() => done && onJump?.(step.id)}
          >
            <span className="step-num">
              {done ? <Icon name="check" alt="" /> : step.id}
            </span>
            {step.label}
          </button>
        );
      })}
    </div>
  );
}

export function Radio({ checked }: { checked: boolean }) {
  if (checked) return <Icon name="radio-on" alt="" />;
  return <span className="radio-off" />;
}

export function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`toggle${checked ? " on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <i />
    </button>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="dock">
      <button type="button" className="primary" disabled={disabled} onClick={onClick}>
        {children}
      </button>
      <HomeIndicator />
    </div>
  );
}

export function Sheet({
  title,
  onClose,
  children,
  tall,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  tall?: boolean;
}) {
  return (
    <div className="sheet-root">
      <button type="button" className="scrim" aria-label="Закрыть" onClick={onClose} />
      <div className={`sheet${tall ? " tall" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="grabber" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <Icon name="xmark" alt="" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        <HomeIndicator />
      </div>
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="search">
      <Icon name="search" alt="" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}

export function HelpButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="help-btn" onClick={onClick} aria-label={label}>
      <Icon name="question" alt="" />
    </button>
  );
}
