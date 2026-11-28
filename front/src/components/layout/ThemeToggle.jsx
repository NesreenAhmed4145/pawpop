import { FaSun, FaMoon } from "react-icons/fa";
import useTheme from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="relative inline-flex h-12 w-[80px] shrink-0 items-center rounded-full border border-ink/20 bg-section transition-colors focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/30"
    >
      <FaSun
        size={20}
        className="absolute left-2.5 text-brand"
        aria-hidden="true"
      />

      <FaMoon
        size={20}
        className="absolute right-2.5 text-brand"
        aria-hidden="true"
      />

      <span
        className={`absolute left-0.5 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-contrast shadow transition-transform duration-300 ${
          isDark ? "translate-x-9" : "translate-x-0"
        }`}
      >
        {isDark ? <FaMoon size={19} /> : <FaSun size={19} />}
      </span>
    </button>
  );
}

