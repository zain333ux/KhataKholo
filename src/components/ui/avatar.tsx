import { clsx } from "clsx";

type AvatarSize = "sm" | "md" | "lg";

const sizes: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const colors = [
  "bg-emerald-600",
  "bg-sky-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-teal-600",
  "bg-indigo-600",
  "bg-orange-600",
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

type AvatarProps = {
  name: string;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const colorClass = getColorForName(name);

  return (
    <div
      className={clsx(
        "grid shrink-0 place-items-center rounded-full font-bold text-white",
        sizes[size],
        colorClass,
        className,
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
