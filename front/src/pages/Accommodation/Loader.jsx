import { PawPrint } from 'lucide-react';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center gap-4 p-16">
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <PawPrint
            key={i}
            size={28}
            className="animate-bounce text-brand"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-sm text-text-muted">{text}</p>
    </div>
  );
}