# Battleship visual direction

## Chosen world

The interface uses the challenger direction B: a Paula Scher street-poster
grammar. Taxi yellow and paper white establish the field; black condensed
display type creates architectural scale; red-orange is reserved for the
active call to action.

## Interface rules

- The current turn is the loudest visual statement.
- Boards remain the product: square cells, coordinate labels, and a clean
  two-board reading order are never obscured by typography.
- Hit, miss, sunk, and placement states differ by color, border treatment, and
  symbol.
- Placement uses a compact side rail for fleet controls, legend, and the start
  action so the board pair owns the first desktop viewport.
- Fleet entries use poster-like ruled rows and strike-through for sunk ships.
- Controls use hard rectangular print forms instead of rounded cards, gradients,
  glass, or decorative shadow chrome.
- Display copy is uppercase through CSS and uses Big Shoulders Display;
  workhorse interface copy uses Barlow Condensed.
- A cropped FLEET mark bleeds from the masthead edge without crossing a
  control. The second board is deliberately offset while both grids retain
  fixed geometry.
- Miss, hit, and sunk marks are authored SVG symbols; focus uses a paper inner
  ring and black outer ring so it survives every cell and button surface.

## Motion and responsive behavior

The turn band is the single authored poster-rise moment with an exponential
ease-out. Reduced-motion users receive the same visible state without the
animation. At narrow widths the boards stack, labels remain inside each board
frame, and the action controls wrap without horizontal overflow.
