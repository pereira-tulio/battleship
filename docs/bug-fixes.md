# Bug fixes and risk validation

| Bug/risk identified | How reproduced or detected | Root cause | Fix implemented | How validated |
| --- | --- | --- | --- | --- |
| AI could repeat a coordinate | Full-board simulation exposed duplicate shot attempts | Target queue and hunt candidates were not centrally checked | AI state keeps a fired-coordinate set and filters every candidate | `src/game/__tests__/game.test.ts` exhausts 100 cells and asserts 100 unique coordinates |
| Vertical placement could cross the bottom edge | Placement boundary cases were tested at row 9 with a vertical destroyer | Validation checked only the origin rather than every generated cell | `canPlaceShip` generates all cells and requires each to be inside the board | Placement test covers valid vertical and out-of-bounds cases |
| Invalid placement could appear selectable | UI placement review identified overlap/out-of-bounds previews | Preview did not share the same validator as placement | Preview computes `canPlaceShip` and uses explicit valid/invalid high-contrast states | UI uses the same pure validator before dispatching placement |
| A queued AI move could affect a fresh game | AI delay plus New Game is a stale-work race risk | Pending timeout can outlive the phase it was created for | Hook cleanup clears timers on unmount and phase changes; reducer phase gates AI actions | Effect cleanup and `aiTurn` phase guard prevent cross-game dispatch |
| New Game could retain deployed fleet state | Reset flow was reviewed after random deployment | Game reset did not rebuild the initial state | New Game creates fresh boards, AI state, placement phase, and winner state | UI flow test verifies `0 / 5 deployed` after New Game |
