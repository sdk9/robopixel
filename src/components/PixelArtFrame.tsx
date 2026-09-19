import { Cpu } from "lucide-react";

type PixelArtFrameProps = {
  src: string;
  alt: string;
  label: string;
  meta?: string;
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
};

export function PixelArtFrame({
  src,
  alt,
  label,
  meta = "WORKSHOP FEED",
  className = "",
  imageClassName = "aspect-[16/9]",
  loading = "eager",
}: PixelArtFrameProps) {
  return (
    <figure
      className={`pixel-grid group relative border border-border bg-card p-2 shadow-[6px_6px_0_var(--line)] ${className}`}
    >
      <span className="absolute -left-px -top-px z-20 size-3 border-b border-r border-foreground bg-primary" />
      <span className="absolute -right-px -top-px z-20 size-3 border-b border-l border-foreground bg-primary" />
      <span className="absolute -bottom-px -left-px z-20 size-3 border-r border-t border-foreground bg-primary" />
      <span className="absolute -bottom-px -right-px z-20 size-3 border-l border-t border-foreground bg-primary" />

      <div className="relative overflow-hidden border border-foreground/25 bg-secondary">
        <img
          src={src}
          alt={alt}
          width={1280}
          height={714}
          loading={loading}
          decoding="async"
          fetchPriority={loading === "eager" ? "high" : "auto"}
          className={`${imageClassName} w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(47,52,54,.045)_50%)] bg-[length:100%_4px]" />
        <div className="absolute left-3 top-3 flex items-center gap-2 border border-foreground/20 bg-background/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[.16em] backdrop-blur-sm">
          <span className="size-1.5 animate-pulse bg-primary motion-reduce:animate-none" />
          {meta}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-2 border border-foreground/20 bg-background/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[.16em] backdrop-blur-sm">
          <Cpu className="size-3 text-primary" />
          {label}
        </div>
      </div>
    </figure>
  );
}
