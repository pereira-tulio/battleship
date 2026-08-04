import type { ShipName } from '../game/types';

type ShipIconProps = {
  name: ShipName;
  className?: string;
};

export function ShipIcon({ name, className = '' }: ShipIconProps) {
  return (
    <svg
      className={`ship-icon ship-icon-${name.toLowerCase()} ${className}`}
      viewBox="0 0 40 20"
      aria-hidden="true"
      focusable="false"
    >
      {name === 'Carrier' && (
        <>
          <path d="M2 13h36l-5 4H7z" />
          <path d="M7 10h25l3 3H4z" />
          <path d="M14 6h12v4H14zM17 3h6v3h-6z" />
          <path d="M4 18h32" />
        </>
      )}
      {name === 'Battleship' && (
        <>
          <path d="M3 12h34l-5 5H8z" />
          <path d="M10 8h18v4H10z" />
          <path d="M14 4h5v4h-5zM24 3h5v5h-5z" />
          <path d="M12 3h6M23 2h7" />
        </>
      )}
      {name === 'Cruiser' && (
        <>
          <path d="M4 12h32l-6 5H10z" />
          <path d="M12 7h14v5H12z" />
          <path d="M16 3h6v4h-6zM24 5h6v2h-6z" />
        </>
      )}
      {name === 'Submarine' && (
        <>
          <path d="M3 12c3-5 31-5 34 0-3 7-31 7-34 0Z" />
          <path d="M17 7V3h7v4M20 3V1" />
          <path d="M8 12h24" />
        </>
      )}
      {name === 'Destroyer' && (
        <>
          <path d="M4 12h32l-7 5H11z" />
          <path d="M13 7h12v5H13zM18 4h5v3h-5z" />
          <path d="M2 18h36" />
        </>
      )}
    </svg>
  );
}
