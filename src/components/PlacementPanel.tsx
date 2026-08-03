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
        <span className="eyebrow">DEPLOYMENT</span>
        <p>
          Place <strong>{selected}</strong> ({selectedSpec?.size} cells){' '}
          <span className="orientation">• {orientation}</span>
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
          ↻ Rotate <kbd>R</kbd>
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
