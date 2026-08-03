import { FLEET } from '../game/fleet';
import type { Board } from '../game/types';

type FleetStatusProps = {
  board: Board;
  label: string;
  selectable?: boolean;
  selected?: string;
  onSelect?: (name: (typeof FLEET)[number]['name']) => void;
};

export function FleetStatus({
  board,
  label,
  selectable = false,
  selected,
  onSelect,
}: FleetStatusProps) {
  return (
    <div className="fleet-status">
      <h4>{label}</h4>
      <div className="fleet-list">
        {FLEET.map((spec) => {
          const ship = board.ships.find((item) => item.name === spec.name);
          const deployed = Boolean(ship);
          const sunk = Boolean(ship && ship.hits.length >= ship.size);
          const content = (
            <>
              <span>{spec.name}</span>
              <b>{spec.size}</b>
              {sunk && <em aria-label="sunk">◆ sunk</em>}
            </>
          );

          if (!selectable) {
            return (
              <span
                className={`${deployed ? 'deployed' : ''} ${sunk ? 'fleet-sunk' : ''}`}
                key={spec.name}
              >
                {content}
              </span>
            );
          }

          return (
            <button
              className={`${deployed ? 'deployed' : ''} ${
                selected === spec.name ? 'fleet-selected' : ''
              }`}
              key={spec.name}
              disabled={deployed}
              onClick={() => onSelect?.(spec.name)}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
