import React from 'react';
import type { SheetLayout, PlacedBoard } from '../types';
import { SHEET_LENGTH, SHEET_WIDTH } from '../types';
import './SheetVisualization.css';

interface SheetVisualizationProps {
  sheets: SheetLayout[];
  sheetIndex: number;
}

// scale factor for visualizing sheet; higher value makes the drawing larger
// approximately 4 pixels per inch gives a sheet ~384px × 192px. Using 4x previous
const SCALE = 6; // pixels per inch (increased to make canvas ~7.5x larger)

export const SheetVisualization: React.FC<SheetVisualizationProps> = ({ sheets, sheetIndex }) => {
  if (!sheets || sheets.length === 0) {
    return <div className="sheet-viz">No layout data available</div>;
  }

  if (sheetIndex >= sheets.length) {
    return <div className="sheet-viz">Invalid sheet index</div>;
  }

  const sheet = sheets[sheetIndex];
  const canvasWidth = SHEET_LENGTH * SCALE;
  const canvasHeight = SHEET_WIDTH * SCALE;

  // Generate colors for different boards
  const colors: { [key: string]: string } = {};
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#FFA07A', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E2', '#F8B88B',
    '#52B788', '#FFB703', '#D62828',
  ];

  sheet.boards.forEach((pb, idx) => {
    if (!colors[pb.board.id]) {
      colors[pb.board.id] = colorPalette[idx % colorPalette.length];
    }
  });

  return (
    <div className="sheet-viz">
      <h3>Sheet {sheetIndex + 1}</h3>
      
      <div className="viz-info">
        <span>Boards: {sheet.boards.length}</span>
        <span>Area Used: {(SHEET_LENGTH * SHEET_WIDTH - sheet.waste).toFixed(0)} sq in</span>
        <span>Waste: {sheet.waste.toFixed(0)} sq in ({((sheet.waste / (SHEET_LENGTH * SHEET_WIDTH)) * 100).toFixed(1)}%)</span>
      </div>

      <svg
        width={canvasWidth + 20}
        height={canvasHeight + 20}
        className="sheet-canvas"
        viewBox={`-10 -10 ${canvasWidth + 20} ${canvasHeight + 20}`}
      >
        {/* Sheet outline */}
        <rect
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          fill="white"
          stroke="#333"
          strokeWidth={2}
        />

        {/* Grid for reference */}
        {Array.from({ length: Math.ceil(SHEET_LENGTH / 12) + 1 }).map((_, i) => (
          <line
            key={`vline-${i}`}
            x1={i * 12 * SCALE}
            y1={0}
            x2={i * 12 * SCALE}
            y2={canvasHeight}
            stroke="#e0e0e0"
            strokeWidth={0.5}
            opacity={0.5}
          />
        ))}
        {Array.from({ length: Math.ceil(SHEET_WIDTH / 12) + 1 }).map((_, i) => (
          <line
            key={`hline-${i}`}
            x1={0}
            y1={i * 12 * SCALE}
            x2={canvasWidth}
            y2={i * 12 * SCALE}
            stroke="#e0e0e0"
            strokeWidth={0.5}
            opacity={0.5}
          />
        ))}

        {/* Draw placed boards */}
        {sheet.boards.map((pb, idx) => {
          const w = (pb.rotated ? pb.board.width : pb.board.length) * SCALE;
          const h = (pb.rotated ? pb.board.length : pb.board.width) * SCALE;
          const x = pb.x * SCALE;
          const y = pb.y * SCALE;
          const color = colors[pb.board.id];

          return (
            <g key={`board-${idx}`}>
              {/* Board rectangle */}
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={color}
                stroke="#000"
                strokeWidth={1}
                opacity={0.8}
              />

              {/* Label */}
              <text
                x={x + w / 2}
                y={y + h / 2 - 5}
                textAnchor="middle"
                fontSize="10"
                fill="#000"
                fontWeight="bold"
              >
                {pb.board.name || 'Board'}
              </text>

              {/* Dimensions */}
              <text
                x={x + w / 2}
                y={y + h / 2 + 8}
                textAnchor="middle"
                fontSize="8"
                fill="#000"
              >
                {pb.rotated ? pb.board.width : pb.board.length}" × {pb.rotated ? pb.board.length : pb.board.width}"
              </text>

              {/* Rotation indicator */}
              {pb.rotated && (
                <>
                  <rect
                    x={x + 1}
                    y={y + 2}
                    width={14}
                    height={12}
                    fill="rgba(0,0,0,0.5)"
                    rx={2}
                  />
                  <text
                    x={x + 4}
                    y={y + 12}
                    fontSize="8"
                    fill="#ffffff"
                    fontWeight="bold"
                  >
                    R
                  </text>
                </>
              )}
              {/* Lock indicator when rotation is forbidden */}
              {!pb.board.rotationAllowed && (
                <text
                  x={x + 2}
                  y={y + 10}
                  fontSize="8"
                  fill="#000"
                >
                  🔒
                </text>
              )}
            </g>
          );
        })}

        {/* Dimensions on axis */}
        <text x={canvasWidth / 2} y={canvasHeight + 15} textAnchor="middle" fontSize="12" fill="#666">
          {SHEET_LENGTH}" (8')
        </text>
        <text x={-15} y={canvasHeight / 2} textAnchor="middle" fontSize="12" fill="#666" transform={`rotate(-90 -15 ${canvasHeight / 2})`}>
          {SHEET_WIDTH}" (4')
        </text>
      </svg>

      {/* Legend */}
      <div className="legend">
        <h4>Legend</h4>
        {sheet.boards.reduce((unique: PlacedBoard[], pb) => {
          if (!unique.find(u => u.board.id === pb.board.id)) {
            unique.push(pb);
          }
          return unique;
        }, []).map(pb => (
          <div key={pb.board.id} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: colors[pb.board.id] }}
            ></div>
            <span>{pb.board.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
