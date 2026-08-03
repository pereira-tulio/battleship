import type { Board } from '../game/types';
import { Board as GameBoard } from './Board';
import { FleetStatus } from './FleetStatus';

type BoardPanelProps = {
  board: Board;
  enemy?: boolean;
  interactive?: boolean;
  preview?: Parameters<typeof GameBoard>[0]['preview'];
  previewValid?: boolean;
  onCell?: Parameters<typeof GameBoard>[0]['onCell'];
  onHover?: Parameters<typeof GameBoard>[0]['onHover'];
  shotsLabel: string;
};

export function BoardPanel({
  board,
  enemy = false,
  interactive = false,
  preview,
  previewValid,
  onCell,
  onHover,
  shotsLabel,
}: BoardPanelProps) {
  return (
    <div className={`board-panel ${enemy ? 'enemy-panel' : ''}`}>
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{enemy ? 'BRAVO FLEET' : 'ALPHA FLEET'}</span>
          <h3>{enemy ? 'Enemy waters' : 'Your waters'}</h3>
        </div>
        <span className="counter">{shotsLabel}</span>
      </div>
      <GameBoard
        board={board}
        enemy={enemy}
        interactive={interactive}
        preview={preview}
        previewValid={previewValid}
        onCell={onCell}
        onHover={onHover}
      />
      <FleetStatus board={board} label={enemy ? 'Enemy fleet' : 'Your fleet'} />
      <p className="helper">
        {interactive ? 'Select a coordinate to fire.' : 'Waters are locked.'}
      </p>
    </div>
  );
}
