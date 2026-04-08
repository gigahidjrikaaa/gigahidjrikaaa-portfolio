import { cn } from "@/lib/utils";

type ThemeKey =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "csharp"
  | "cpp"
  | "php"
  | "ruby"
  | "swift"
  | "kotlin"
  | "dart"
  | "elixir"
  | "scala"
  | "shell"
  | "sql"
  | "web"
  | "systems"
  | "unknown";

const LANGUAGE_THEME_MAP: Record<string, ThemeKey> = {
  "typescript": "typescript",
  "tsx": "typescript",
  "javascript": "javascript",
  "jsx": "javascript",
  "python": "python",
  "go": "go",
  "rust": "rust",
  "java": "java",
  "c#": "csharp",
  "f#": "csharp",
  "visual basic .net": "csharp",
  "c++": "cpp",
  "c": "cpp",
  "objective-c": "cpp",
  "objective-c++": "cpp",
  "php": "php",
  "ruby": "ruby",
  "swift": "swift",
  "kotlin": "kotlin",
  "dart": "dart",
  "elixir": "elixir",
  "erlang": "elixir",
  "scala": "scala",
  "haskell": "scala",
  "clojure": "scala",
  "shell": "shell",
  "bash": "shell",
  "powershell": "shell",
  "batchfile": "shell",
  "sql": "sql",
  "plsql": "sql",
  "html": "web",
  "css": "web",
  "scss": "web",
  "less": "web",
  "vue": "web",
  "svelte": "web",
  "astro": "web",
  "markdown": "web",
  "yaml": "web",
  "json": "web",
  "dockerfile": "systems",
  "makefile": "systems",
  "terraform": "systems",
  "hcl": "systems",
  "lua": "systems",
  "r": "systems",
  "jupyter notebook": "systems",
};

const THEME_COLOR_CLASS: Record<ThemeKey, string> = {
  typescript: "text-blue-600",
  javascript: "text-amber-500",
  python: "text-emerald-600",
  go: "text-cyan-600",
  rust: "text-orange-700",
  java: "text-red-600",
  csharp: "text-violet-600",
  cpp: "text-indigo-600",
  php: "text-sky-700",
  ruby: "text-rose-600",
  swift: "text-orange-500",
  kotlin: "text-fuchsia-600",
  dart: "text-teal-600",
  elixir: "text-purple-600",
  scala: "text-pink-600",
  shell: "text-lime-700",
  sql: "text-blue-700",
  web: "text-slate-500",
  systems: "text-zinc-600",
  unknown: "text-gray-500",
};

const getTheme = (language?: string | null): ThemeKey => {
  if (!language) return "unknown";
  return LANGUAGE_THEME_MAP[language.trim().toLowerCase()] || "unknown";
};

const renderPattern = (theme: ThemeKey) => {
  switch (theme) {
    case "typescript":
    case "cpp":
      return (
        <>
          <path d="M-10 80 L120 -10" stroke="currentColor" strokeWidth="7" opacity="0.16" />
          <path d="M20 115 L150 -15" stroke="currentColor" strokeWidth="4" opacity="0.12" />
          <rect x="118" y="8" width="58" height="44" rx="8" fill="currentColor" opacity="0.1" />
        </>
      );
    case "javascript":
    case "dart":
      return (
        <>
          <rect x="88" y="6" width="88" height="22" rx="8" fill="currentColor" opacity="0.12" />
          <rect x="108" y="36" width="68" height="20" rx="8" fill="currentColor" opacity="0.1" />
          <rect x="126" y="64" width="50" height="18" rx="8" fill="currentColor" opacity="0.08" />
        </>
      );
    case "python":
    case "ruby":
      return (
        <>
          <circle cx="150" cy="20" r="46" stroke="currentColor" strokeWidth="4" opacity="0.12" fill="none" />
          <circle cx="146" cy="22" r="30" stroke="currentColor" strokeWidth="3" opacity="0.1" fill="none" />
          <circle cx="140" cy="28" r="16" fill="currentColor" opacity="0.08" />
        </>
      );
    case "go":
    case "shell":
      return (
        <>
          <circle cx="126" cy="20" r="5" fill="currentColor" opacity="0.12" />
          <circle cx="146" cy="24" r="8" fill="currentColor" opacity="0.1" />
          <circle cx="170" cy="30" r="11" fill="currentColor" opacity="0.08" />
          <path d="M98 68 C120 44, 152 42, 178 56" stroke="currentColor" strokeWidth="4" opacity="0.1" fill="none" />
        </>
      );
    case "rust":
    case "java":
      return (
        <>
          <polygon points="142,6 178,18 168,58 128,44" fill="currentColor" opacity="0.1" />
          <path d="M108 76 L182 14" stroke="currentColor" strokeWidth="4" opacity="0.14" />
          <path d="M122 92 L188 36" stroke="currentColor" strokeWidth="3" opacity="0.1" />
        </>
      );
    case "csharp":
    case "kotlin":
    case "elixir":
      return (
        <>
          <path d="M116 18 Q146 -8 176 18 Q146 44 116 18" fill="currentColor" opacity="0.1" />
          <path d="M112 50 Q148 28 182 50 Q148 74 112 50" fill="currentColor" opacity="0.08" />
          <path d="M106 82 Q148 58 190 82" stroke="currentColor" strokeWidth="4" opacity="0.12" fill="none" />
        </>
      );
    case "php":
    case "swift":
      return (
        <>
          <rect x="110" y="10" width="68" height="68" rx="18" fill="currentColor" opacity="0.08" />
          <path d="M118 22 L170 22" stroke="currentColor" strokeWidth="4" opacity="0.14" />
          <path d="M118 38 L170 38" stroke="currentColor" strokeWidth="4" opacity="0.12" />
          <path d="M118 54 L156 54" stroke="currentColor" strokeWidth="4" opacity="0.1" />
        </>
      );
    case "scala":
    case "sql":
      return (
        <>
          <ellipse cx="150" cy="18" rx="34" ry="10" fill="currentColor" opacity="0.1" />
          <path d="M116 18 V58 C116 64 130 68 150 68 C170 68 184 64 184 58 V18" fill="currentColor" opacity="0.08" />
          <ellipse cx="150" cy="58" rx="34" ry="10" fill="currentColor" opacity="0.1" />
        </>
      );
    case "web":
    case "systems":
    case "unknown":
    default:
      return (
        <>
          <path d="M100 10 L186 10" stroke="currentColor" strokeWidth="3" opacity="0.1" />
          <path d="M100 32 L186 32" stroke="currentColor" strokeWidth="3" opacity="0.08" />
          <path d="M100 54 L186 54" stroke="currentColor" strokeWidth="3" opacity="0.08" />
          <path d="M128 0 L128 74" stroke="currentColor" strokeWidth="3" opacity="0.08" />
          <path d="M158 0 L158 74" stroke="currentColor" strokeWidth="3" opacity="0.08" />
        </>
      );
  }
};

interface LanguageDecorationProps {
  language?: string | null;
  className?: string;
}

const LanguageDecoration = ({ language, className }: LanguageDecorationProps) => {
  const theme = getTheme(language);

  return (
    <div
      className={cn(
        "pointer-events-none absolute right-0 top-0 h-24 w-48 overflow-hidden",
        THEME_COLOR_CLASS[theme],
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 190 100"
        preserveAspectRatio="xMaxYMin meet"
        className="h-full w-full"
        focusable="false"
      >
        {renderPattern(theme)}
      </svg>
    </div>
  );
};

export default LanguageDecoration;
