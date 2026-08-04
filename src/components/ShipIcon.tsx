import type { ShipName } from '../game/types';

type ShipIconProps = {
  name: ShipName;
  className?: string;
  profile?: boolean;
};

const profileViewBox: Record<ShipName, string> = {
  Carrier: '0 0 180 20',
  Battleship: '0 0 145 20',
  Cruiser: '0 0 110 20',
  Submarine: '0 0 110 20',
  Destroyer: '0 0 70 20',
};

export function ShipIcon({ name, className = '', profile = false }: ShipIconProps) {
  return (
    <svg
      className={`ship-icon ship-icon-${name.toLowerCase()} ${className}`}
      viewBox={profile ? profileViewBox[name] : '0 0 40 20'}
      aria-hidden="true"
      focusable="false"
    >
      {profile && name === 'Carrier' && (
        <>
          <path d="M10 13h160l-16 5H26z" />
          <path d="M28 10h118l12 3H18z" />
          <path d="M68 6h42v4H68zM76 3h26v3H76z" />
          <path d="M12 18h156" />
        </>
      )}
      {profile && name === 'Battleship' && (
        <>
          <path d="M8 13h129l-16 5H24z" />
          <path d="M30 9h78v4H30z" />
          <path d="M42 4h18v5H42zM82 3h18v6H82z" />
          <path d="M40 3h22M80 2h24" />
        </>
      )}
      {profile && name === 'Cruiser' && (
        <>
          <path d="M8 13h94l-16 5H24z" />
          <path d="M31 8h46v5H31z" />
          <path d="M44 3h20v5H44zM72 5h18v3H72z" />
        </>
      )}
      {profile && name === 'Submarine' && (
        <>
          <path d="M8 12c9-6 87-6 94 0-8 7-85 7-94 0Z" />
          <path d="M48 7V3h20v4M55 3V1" />
          <path d="M20 12h70" />
        </>
      )}
      {profile && name === 'Destroyer' && (
        <>
          <path d="M5 13h60l-10 5H15z" />
          <path d="M23 8h23v5H23zM32 4h11v4H32z" />
          <path d="M7 18h56" />
        </>
      )}
      {!profile && name === 'Carrier' && (
        <>
          <path d="M2 13h36l-5 4H7z" />
          <path d="M7 10h25l3 3H4z" />
          <path d="M14 6h12v4H14zM17 3h6v3h-6z" />
          <path d="M4 18h32" />
        </>
      )}
      {!profile && name === 'Battleship' && (
        <>
          <path d="M3 12h34l-5 5H8z" />
          <path d="M10 8h18v4H10z" />
          <path d="M14 4h5v4h-5zM24 3h5v5h-5z" />
          <path d="M12 3h6M23 2h7" />
        </>
      )}
      {!profile && name === 'Cruiser' && (
        <>
          <path d="M4 12h32l-6 5H10z" />
          <path d="M12 7h14v5H12z" />
          <path d="M16 3h6v4h-6zM24 5h6v2h-6z" />
        </>
      )}
      {!profile && name === 'Submarine' && (
        <>
          <path d="M3 12c3-5 31-5 34 0-3 7-31 7-34 0Z" />
          <path d="M17 7V3h7v4M20 3V1" />
          <path d="M8 12h24" />
        </>
      )}
      {!profile && name === 'Destroyer' && (
        <>
          <path d="M4 12h32l-7 5H11z" />
          <path d="M13 7h12v5H13zM18 4h5v3h-5z" />
          <path d="M2 18h36" />
        </>
      )}
    </svg>
  );
}
