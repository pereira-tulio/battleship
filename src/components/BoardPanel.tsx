import type { Board } from '../game/types';
import type { Phase } from '../hooks/useBattleship';
import { Board as GameBoard } from './Board';
import { AttackIcon } from './AttackIcon';
import { FleetStatus } from './FleetStatus';

type BoardPanelProps = {
  board: Board;
  enemy?: boolean;
  interactive?: boolean;
  preview?: Parameters<typeof GameBoard>[0]['preview'];
  previewValid?: boolean;
  latestShot?: Parameters<typeof GameBoard>[0]['latestShot'];
  aimingShot?: Parameters<typeof GameBoard>[0]['aimingShot'];
  onCell?: Parameters<typeof GameBoard>[0]['onCell'];
  onHover?: Parameters<typeof GameBoard>[0]['onHover'];
  onMouseLeave?: () => void;
  onBlur?: () => void;
  shotsLabel: string;
  phase: Phase;
};

export function BoardPanel({
  board,
  enemy = false,
  interactive = false,
  preview,
  previewValid,
  latestShot,
  aimingShot,
  onCell,
  onHover,
  onMouseLeave,
  onBlur,
  shotsLabel,
  phase,
}: BoardPanelProps) {
  return (
    <div className={`board-panel ${enemy ? 'enemy-panel' : ''}`}>
      <div className="panel-heading">
        <div>
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
        latestShot={latestShot}
        aimingShot={aimingShot}
        onCell={onCell}
        onHover={onHover}
        onMouseLeave={onMouseLeave}
        onBlur={onBlur}
      />
      <FleetStatus board={board} label={enemy ? 'Enemy fleet' : 'Your fleet'} />
      <p className="helper">
        {enemy ? (
          interactive ? (
            <>
              <AttackIcon /> Select a coordinate to fire.
            </>
          ) : (
            'Waters are locked.'
          )
        ) : phase === 'placement' ? (
          'Select a coordinate to place your ship.'
        ) : (
          'Fleet deployed.'
        )}
      </p>
    </div>
  );
}
