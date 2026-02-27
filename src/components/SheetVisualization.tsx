import React, { useRef, useState } from 'react';
import type { SheetLayout, PlacedBoard } from '../types';
import { SHEET_LENGTH, SHEET_WIDTH } from '../types';
import './SheetVisualization.css';

interface SheetVisualizationProps {
  sheets: SheetLayout[];
  sheetIndex: number;
  sheetLength?: number; // inches
  sheetWidth?: number;  // inches
}

// scale factor for visualizing sheet; higher value makes the drawing larger
// approximately 4 pixels per inch gives a sheet ~384px × 192px. Using 4x previous
const SCALE = 6; // pixels per inch (increased to make canvas ~7.5x larger)

export const SheetVisualization: React.FC<SheetVisualizationProps> = ({ sheets, sheetIndex, sheetLength, sheetWidth }) => {
  if (!sheets || sheets.length === 0) {
    return <div className="sheet-viz">No layout data available</div>;
  }

  if (sheetIndex >= sheets.length) {
    return <div className="sheet-viz">Invalid sheet index</div>;
  }

  const sheet = sheets[sheetIndex];
  const length = sheetLength != null ? sheetLength : SHEET_LENGTH;
  const width = sheetWidth != null ? sheetWidth : SHEET_WIDTH;
  const canvasWidth = length * SCALE;
  const canvasHeight = width * SCALE;

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

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1);

  const handleSaveSummary = () => {
    const summary = {
      generatedAt: new Date().toISOString(),
      sheetIndex: sheetIndex,
      totalSheets: sheets.length,
      sheets: sheets.map((s, i) => ({
        sheetNumber: i + 1,
        boardsPlaced: s.boards.length,
        waste: s.waste,
        areaUsed: length * width - s.waste,
        boards: s.boards.map(pb => ({
          id: pb.board.id,
          name: pb.board.name,
          length: pb.board.length,
          width: pb.board.width,
          quantity: pb.board.quantity,
          rotated: pb.rotated,
          x: pb.x,
          y: pb.y,
        })),
      })),
    };

    const dataStr = JSON.stringify(summary, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cut-summary-sheet-${sheetIndex + 1}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveSVG = () => {
    const svg = svgRef.current;
    if (!svg) {
      alert('No SVG available to export');
      return;
    }
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    // add name spaces if they are missing
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sheet-${sheetIndex + 1}-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSavePNG = async () => {
    const svg = svgRef.current;
    if (!svg) {
      alert('No SVG available to export');
      return;
    }

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const svg64 = btoa(unescape(encodeURIComponent(source)));
    const imgSrc = 'data:image/svg+xml;base64,' + svg64;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(svg.clientWidth * scaleMultiplier);
      canvas.height = Math.round(svg.clientHeight * scaleMultiplier);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Unable to get canvas context');
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to create PNG');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sheet-${sheetIndex + 1}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    };
    img.onerror = () => alert('Failed to load SVG for PNG export');
    img.src = imgSrc;
  };

  // Generate a simple SVG string for a given sheet (used to export all sheets)
  const generateSVGStringForSheet = (s: typeof sheet /*, idx: number */) => {
    const length = sheetLength != null ? sheetLength : SHEET_LENGTH;
    const width = sheetWidth != null ? sheetWidth : SHEET_WIDTH;
    const canvasW = length * SCALE + 20;
    const canvasH = width * SCALE + 20;

    // simple XML escaping for text nodes
    const escapeXml = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // colors
    const colorPalette = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E2', '#F8B88B', '#52B788', '#FFB703', '#D62828',
    ];
    const colors: { [key: string]: string } = {};
    s.boards.forEach((pb, i) => {
      if (!colors[pb.board.id]) colors[pb.board.id] = colorPalette[i % colorPalette.length];
    });

    const rects = s.boards.map((pb, i) => {
      const w = (pb.rotated ? pb.board.width : pb.board.length) * SCALE;
      const h = (pb.rotated ? pb.board.length : pb.board.width) * SCALE;
      const x = pb.x * SCALE + 0;
      const y = pb.y * SCALE + 0;
      const color = colors[pb.board.id];
      const name = escapeXml(pb.board.name || 'Board');
      const dims = pb.rotated
        ? `${pb.board.width}\" × ${pb.board.length}\"`
        : `${pb.board.length}\" × ${pb.board.width}\"`;

      const rotationMarkup = pb.rotated
        ? `\n      <rect x=\"${x + 1}\" y=\"${y + 2}\" width=\"14\" height=\"12\" fill=\"rgba(0,0,0,0.5)\" rx=\"2\"/>\n      <text x=\"${x + 4}\" y=\"${y + 12}\" font-size=\"8\" fill=\"#ffffff\" font-weight=\"bold\">R</text>`
        : '';

      const lockMarkup = pb.board.rotationAllowed === false
        ? `\n      <text x=\"${x + 2}\" y=\"${y + 10}\" font-size=\"8\" fill=\"#000\">🔒</text>`
        : '';

      const qtyMarkup = (pb.board.quantity && pb.board.quantity > 1)
        ? `\n      <text x=\"${x + w - 6}\" y=\"${y + 12}\" font-size=\"8\" fill=\"#000\" text-anchor=\"end\">x${pb.board.quantity}</text>`
        : '';

      return `\n    <g key=\"r${i}\">\n      <rect x=\"${x}\" y=\"${y}\" width=\"${w}\" height=\"${h}\" fill=\"${color}\" stroke=\"#000\" stroke-width=\"1\" opacity=\"0.8\"/>\n      <text x=\"${x + w / 2}\" y=\"${y + h / 2 - 6}\" text-anchor=\"middle\" font-size=\"10\" fill=\"#000\" font-weight=\"bold\">${name}</text>\n      <text x=\"${x + w / 2}\" y=\"${y + h / 2 + 9}\" text-anchor=\"middle\" font-size=\"8\" fill=\"#000\">${dims}</text>${rotationMarkup}${lockMarkup}${qtyMarkup}\n    </g>`;
    }).join('');

    const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg width=\"${canvasW}\" height=\"${canvasH}\" viewBox=\"-10 -10 ${canvasW} ${canvasH}\" xmlns=\"http://www.w3.org/2000/svg\">\n  <rect x=\"0\" y=\"0\" width=\"${length * SCALE}\" height=\"${width * SCALE}\" fill=\"#ffffff\" stroke=\"#333\" stroke-width=\"2\"/>${rects}\n</svg>`;
    return svg;
  };

  const handleSaveAllPNG = async () => {
    try {
      const imgs: HTMLImageElement[] = [];
      for (let i = 0; i < sheets.length; i++) {
        const svgStr = generateSVGStringForSheet(sheets[i]);
        // create a blob URL to avoid data URI size issues
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const im = new Image();
          im.onload = () => {
            URL.revokeObjectURL(url);
            res(im);
          };
          im.onerror = () => {
            URL.revokeObjectURL(url);
            rej(new Error(`image load failed for sheet ${i}`));
          };
          im.src = url;
        });
        imgs.push(img);
      }

      // compute combined dimensions
      const widths = imgs.map(i => i.width);
      const heights = imgs.map(i => i.height);
      const combinedWidth = Math.max(...widths) * scaleMultiplier;
      const combinedHeight = heights.reduce((a, b) => a + b, 0) * scaleMultiplier + (sheets.length - 1) * 20;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(combinedWidth);
      canvas.height = Math.round(combinedHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to create canvas context');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let y = 0;
      for (let i = 0; i < imgs.length; i++) {
        const iw = imgs[i].width * scaleMultiplier;
        const ih = imgs[i].height * scaleMultiplier;
        ctx.drawImage(imgs[i], 0, 0, imgs[i].width, imgs[i].height, 0, y, iw, ih);
        y += ih + 20; // spacing
      }

      canvas.toBlob((blob) => {
        if (!blob) { alert('Failed to create combined PNG'); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all-sheets-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('handleSaveAllPNG error', err);
      alert('Error exporting all sheets: ' + msg);
    }
  };

  return (
    <div className="sheet-viz">
      <div className="viz-header">
        <h3>Sheet {sheetIndex + 1}</h3>
        <div className="header-buttons">
          <button onClick={handleSaveSummary} className="btn-save">Save Summary</button>
          <button onClick={handleSaveSVG} className="btn-save">Save SVG</button>
          <button onClick={handleSavePNG} className="btn-save">Save PNG</button>
          <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
            Scale:
            <input
              type="number"
              min={1}
              step={0.5}
              value={scaleMultiplier}
              onChange={(e) => setScaleMultiplier(parseFloat(e.target.value) || 1)}
              className="scale-input"
              style={{width: 70}}
            />
          </label>
          <button onClick={async () => { await handleSaveAllPNG(); }} className="btn-save">Save All (PNG)</button>
        </div>
      </div>
      
      <div className="viz-info">
        <span>Boards: {sheet.boards.length}</span>
        <span>Area Used: {(length * width - sheet.waste).toFixed(0)} sq in</span>
        <span>Waste: {sheet.waste.toFixed(0)} sq in ({((sheet.waste / (length * width)) * 100).toFixed(1)}%)</span>
      </div>

      <svg
        ref={svgRef}
        width={canvasWidth + 20}
        height={canvasHeight + 20}
        className="sheet-canvas"
        viewBox={`-10 -10 ${canvasWidth + 20} ${canvasHeight + 20}`}
        xmlns="http://www.w3.org/2000/svg"
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
        {Array.from({ length: Math.ceil(length / 12) + 1 }).map((_, i) => (
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
        {Array.from({ length: Math.ceil(width / 12) + 1 }).map((_, i) => (
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
              {/* Quantity label when more than one */}
              {pb.board.quantity && pb.board.quantity > 1 && (
                <text
                  x={x + w - 6}
                  y={y + 12}
                  fontSize="8"
                  fill="#000"
                  textAnchor="end"
                >
                  x{pb.board.quantity}
                </text>
              )}
            </g>
          );
        })}

        {/* Dimensions on axis */}
        <text x={canvasWidth / 2} y={canvasHeight + 15} textAnchor="middle" fontSize="12" fill="#666">
          {length}"
        </text>
        <text x={-15} y={canvasHeight / 2} textAnchor="middle" fontSize="12" fill="#666" transform={`rotate(-90 -15 ${canvasHeight / 2})`}>
          {width}" 
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
