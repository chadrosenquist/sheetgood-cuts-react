import { useState, useMemo } from 'react';
import type { Board, OptimizationResult } from './types';
import { optimizePlacement } from './packing';
import { CutListForm } from './components/CutListForm';
import { SheetVisualization } from './components/SheetVisualization';
import './App.css';

function App() {
  const [boards, setBoards] = useState<Board[]>([
    {
      id: '1',
      length: 24,
      width: 12,
      depth: 1,
      quantity: 4,
      name: 'Side Panels',
      rotationAllowed: false,
    },
    {
      id: '2',
      length: 48,
      width: 12,
      depth: 1,
      quantity: 2,
      name: 'Top/Bottom',
      rotationAllowed: false,
    },
  ]);

  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);

  // sheet dimensions (in inches)
  const [sheetLength, setSheetLength] = useState<number>(96);
  const [sheetWidth, setSheetWidth] = useState<number>(48);

  const result: OptimizationResult | null = useMemo(() => {
    if (boards.length === 0) return null;
    return optimizePlacement(boards, sheetLength, sheetWidth);
  }, [boards, sheetLength, sheetWidth]);

  const handleBoardsUpdated = (updatedBoards: Board[]) => {
    setBoards(updatedBoards);
    setCurrentSheetIndex(0); // Reset to first sheet when boards change
  };

  const totalArea = boards.reduce((sum, b) => sum + b.length * b.width * b.quantity, 0);
  const requiredSheets = result ? result.sheets.length : 0;
  const sheetArea = sheetLength * sheetWidth;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🪵 SheetGood Cuts</h1>
        <p>Optimize your plywood cuts efficiently</p>
      </header>

      <main className="app-main">
        <div className="container">
          {/* Left Column - Input */}
          <div className="left-column">
            <div className="sheet-size-form">
              <h2>Sheet Size (inches)</h2>
              <div className="sheet-size-row">
                <label>
                  Length:
                  <input
                    type="number"
                    value={sheetLength}
                    onChange={(e) => setSheetLength(parseFloat(e.target.value) || 0)}
                    min="1"
                  />
                </label>
                <label>
                  Width:
                  <input
                    type="number"
                    value={sheetWidth}
                    onChange={(e) => setSheetWidth(parseFloat(e.target.value) || 0)}
                    min="1"
                  />
                </label>
              </div>
              <CutListForm onBoardsUpdated={handleBoardsUpdated} />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="right-column">
            {result && result.sheets.length > 0 ? (
              <>
                {/* Summary Statistics */}
                <div className="summary-stats">
                  <h2>Optimization Summary</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{result.sheets.length}</div>
                      <div className="stat-label">Sheets Required</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{((totalArea / (requiredSheets * sheetArea)) * 100).toFixed(1)}%</div>
                      <div className="stat-label">Material Efficiency</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{result.totalBoardsPlaced}</div>
                      <div className="stat-label">Total Pieces</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">${(result.sheets.length * 45).toFixed(2)}</div>
                      <div className="stat-label">Material Cost*</div>
                      <small>*at $45/sheet ({sheetWidth}"×{sheetLength}")</small>
                    </div>
                  </div>
                </div>

                {/* Sheet Navigation */}
                <div className="sheet-navigation">
                  <button
                    onClick={() => setCurrentSheetIndex(Math.max(0, currentSheetIndex - 1))}
                    disabled={currentSheetIndex === 0}
                    className="nav-btn"
                  >
                    ← Previous
                  </button>
                  
                  <div className="sheet-counter">
                    Sheet {currentSheetIndex + 1} of {result.sheets.length}
                  </div>

                  <button
                    onClick={() => setCurrentSheetIndex(Math.min(result.sheets.length - 1, currentSheetIndex + 1))}
                    disabled={currentSheetIndex === result.sheets.length - 1}
                    className="nav-btn"
                  >
                    Next →
                  </button>
                </div>

                {/* Sheet Visualization */}
                <SheetVisualization
                  sheets={result.sheets}
                  sheetIndex={currentSheetIndex}
                  sheetLength={sheetLength}
                  sheetWidth={sheetWidth}
                />

                {/* Detailed Breakdown */}
                <div className="sheet-breakdown">
                  <h2>Sheet Breakdown</h2>
                  <div className="breakdown-grid">
                    {result.sheets.map((sheet, idx) => (
                      <div
                        key={idx}
                        className={`breakdown-item ${idx === currentSheetIndex ? 'active' : ''}`}
                        onClick={() => setCurrentSheetIndex(idx)}
                      >
                        <div className="breakdown-header">Sheet {idx + 1}</div>
                        <div className="breakdown-content">
                          <div>{sheet.boards.length} pieces</div>
                          <div>{((sheet.waste / sheetArea) * 100).toFixed(1)}% waste</div>
                        </div>
                        <div className="breakdown-efficiency">
                          {(((sheetArea - sheet.waste) / sheetArea) * 100).toFixed(0)}% used
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Print Friendly Cut List */}
                <div className="cut-summary">
                  <h2>Cut Summary for Sheet {currentSheetIndex + 1}</h2>
                  <div className="cut-list">
                    {result.sheets[currentSheetIndex].boards.map((pb, idx) => (
                      <div key={idx} className="cut-item">
                        <span className="cut-name">{pb.board.name}</span>
                        <span className="cut-dims">
                          {pb.rotated ? pb.board.width : pb.board.length}" × {pb.rotated ? pb.board.length : pb.board.width}" 
                          {pb.rotated && ' (rotated)'}
                          {!pb.board.rotationAllowed && !pb.rotated && (
                            <span className="no-rotate"> (no rotate)</span>
                          )}
                        </span>
                        <span className="cut-pos">Position: ({pb.x.toFixed(1)}", {pb.y.toFixed(1)}")</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unplaced Boards (too large to fit) */}
                {result.unplaced && result.unplaced.length > 0 && (
                  <div className="unplaced-list">
                    <h2>Unplaced Boards</h2>
                    <p className="warning">The following pieces could not fit on any sheet:</p>
                    <ul>
                      {result.unplaced.map((b, idx) => (
                        <li key={idx}>
                          {b.name || 'Board'} – {b.length}" × {b.width}" (quantity 1)
                          {!b.rotationAllowed && ' (rotation forbidden)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <p>Add boards to the cut list to see optimization results</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built for woodworkers | Optimize your plywood usage</p>
      </footer>
    </div>
  );
}

export default App;
