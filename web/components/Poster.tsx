interface Props {
  src: string;
  title: string;
  className?: string;
}

/** Cover image, or a big initial on a flat tile when there isn't one. */
export function Poster({ src, title, className = "" }: Props) {
  return (
    <div className={`flex items-end overflow-hidden bg-line ${className}`}>
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="p-3 text-6xl font-bold leading-none text-fg/15">{title.charAt(0)}</span>
      )}
    </div>
  );
}