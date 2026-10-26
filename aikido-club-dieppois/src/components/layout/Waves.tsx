export default function Waves({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`waves ${className}`}>
      <div className="wave-layer wave-layer-back" />
      <div className="wave-layer wave-layer-mid" />
      <div className="wave-layer wave-layer-front" />
    </div>
  );
}