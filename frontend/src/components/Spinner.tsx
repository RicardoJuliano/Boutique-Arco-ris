export default function Spinner({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`${className} border-2 border-gold border-t-transparent rounded-full animate-spin`} />
  );
}
