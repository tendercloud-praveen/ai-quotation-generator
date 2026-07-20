import { initials } from '../lib/validate';

export default function Avatar({ name = '', color, size = 36, src }) {
  return (
    <div
      className="grid place-items-center rounded-full font-semibold text-white shrink-0 overflow-hidden"
      style={{ background: color || '#3385ff', width: size, height: size, fontSize: size * 0.36 }}
    >
      {src ? (
        <img src={src} alt={name || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <span>{initials(name) || '?'}</span>
      )}
    </div>
  );
}
