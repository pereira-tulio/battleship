import type { ShipName } from '../game/types';
import { FLEET } from '../game/fleet';
import { FleetStatus } from './FleetStatus';

type PlacementPanelProps = {
  selected: ShipName;
  playerBoard: Parameters<typeof FleetStatus>[0]['board'];
  orientation: 'horizontal' | 'vertical';
  onRotate: () => void;
  onRandomize: () => void;
  onReset: () => void;
  onSelectShip: (name: ShipName) => void;
};

export function PlacementPanel({
  selected,
  playerBoard,
  orientation,
  onRotate,
  onRandomize,
  onReset,
  onSelectShip,
}: PlacementPanelProps) {
  const selectedSpec = FLEET.find((ship) => ship.name === selected);

  return (
    <section className="controls">
      <div>
        <p className="control-heading">Place your fleet</p>
        <p className="control-copy">
          Place <strong>{selected}</strong> ({selectedSpec?.size} cells){' '}
          <span className="orientation">{orientation}</span>
        </p>
        <FleetStatus
          board={playerBoard}
          label="Select a ship"
          selectable
          selected={selected}
          onSelect={onSelectShip}
        />
      </div>
      <div className="control-actions">
        <button className="button button-outline" onClick={onRotate}>
          <svg
            className="rotate-mark"
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M16 8a6 6 0 1 0 1 5" />
            <path d="M16 3v5h-5" />
          </svg>
          Rotate <kbd>R</kbd>
        </button>
        <button className="button button-outline" onClick={onRandomize}>
          Random placement
        </button>
        <button className="button button-outline" onClick={onReset}>
          Reset placement
        </button>
      </div>
    </section>
  );
}
