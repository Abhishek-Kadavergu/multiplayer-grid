import React from "react";

type Cell = { char: string | null; updatedBy?: string };
export default function Grid({
  grid,
  onCellClick,
}: {
  grid: Cell[][];
  onCellClick: (r: number, c: number) => void;
}) {
  const rows = grid?.length || 0;
  const cols = rows ? grid[0].length : 0;
  const totalWidth = Math.min(700, cols * 52);
  return (
    <div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          width: totalWidth,
        }}
      >
        {grid &&
          grid.flatMap((row, r) =>
            row.map((cell, c) => {
              const filled = !!cell.char;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`cell ${filled ? "filled" : ""}`}
                  onClick={() => {
                    if (!filled) onCellClick(r, c);
                  }}
                  title={
                    filled ? `Filled by ${cell.updatedBy}` : "Click to fill"
                  }
                >
                  {cell.char ?? ""}
                </div>
              );
            })
          )}
      </div>
    </div>
  );
}
