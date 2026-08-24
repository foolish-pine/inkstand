import Link from "next/link";

export function Wordmark() {
  return (
    <Link
      href="/"
      className="focus-visible:outline-accent flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <span aria-hidden className="bg-seal size-2" />
      <span className="font-display text-lg tracking-[0.3em]">inkstand</span>
    </Link>
  );
}
