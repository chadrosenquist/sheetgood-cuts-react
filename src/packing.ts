import type { Board, PlacedBoard, SheetLayout, OptimizationResult } from './types';
import { SHEET_LENGTH, SHEET_WIDTH } from './types';

// Simple guillotine packing algorithm for 2D bin packing
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

class Sheet {
  width: number;
  height: number;
  usedRects: Rect[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  canPlace(boardLength: number, boardWidth: number, rotationAllowed: boolean = true): boolean {
    // Try without rotation
    if (this.findSpace(boardLength, boardWidth)) return true;
    // Try with rotation if permitted
    if (rotationAllowed && this.findSpace(boardWidth, boardLength)) return true;
    return false;
  }

  private findSpace(w: number, h: number): Rect | null {
    // Simple bottom-left heuristic
    // Try to place at various positions, prioritizing lower-left
    
    if (w > this.width || h > this.height) return null;

    // Generate candidate positions
    const candidates: Array<{ x: number; y: number }> = [];
    
    // Bottom-left corner
    candidates.push({ x: 0, y: 0 });
    
    // Try along existing edges
    for (const rect of this.usedRects) {
      // Right edge
      if (rect.x + rect.width + w <= this.width) {
        candidates.push({ x: rect.x + rect.width, y: rect.y });
      }
      // Top edge
      if (rect.y + rect.height + h <= this.height) {
        candidates.push({ x: rect.x, y: rect.y + rect.height });
      }
    }

    // Sort candidates by (y, then x) to prioritize bottom-left
    candidates.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);

    for (const { x, y } of candidates) {
      if (this.isSpaceAvailable(x, y, w, h)) {
        return { x, y, width: w, height: h };
      }
    }
    
    return null;
  }

  private isSpaceAvailable(x: number, y: number, w: number, h: number): boolean {
    // Check if the space is available (doesn't overlap with used rects)
    // Also check bounds
    if (x < 0 || y < 0 || x + w > this.width || y + h > this.height) {
      return false;
    }
    
    for (const rect of this.usedRects) {
      if (this.rectsOverlap(x, y, w, h, rect.x, rect.y, rect.width, rect.height)) {
        return false;
      }
    }
    return true;
  }

  private rectsOverlap(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /**
   * Attempt to place a board on the sheet.
   * @param boardLength length of the board (in inches)
   * @param boardWidth width of the board (in inches)
   * @param rotationAllowed if true, the board may be rotated 90°
   */
  placeBoard(
    boardLength: number,
    boardWidth: number,
    rotationAllowed: boolean
  ): { position: Rect; rotated: boolean } | null {
    // Try without rotation first
    let space = this.findSpace(boardLength, boardWidth);
    if (space) {
      this.usedRects.push(space);
      return { position: space, rotated: false };
    }

    if (rotationAllowed) {
      // Try with rotation only if allowed
      space = this.findSpace(boardWidth, boardLength);
      if (space) {
        this.usedRects.push(space);
        return { position: space, rotated: true };
      }
    }

    return null;
  }

  calculateWaste(): number {
    const usedArea = this.usedRects.reduce((sum, rect) => sum + rect.width * rect.height, 0);
    return this.width * this.height - usedArea;
  }
}

// Optimized packing using largest-first and bottom-left heuristics
export function optimizePlacement(boards: Board[]): OptimizationResult {
  // Create a list of individual board pieces (respecting quantity)
  const allBoards: Array<{ board: Board; originalIndex: number }> = [];
  boards.forEach((board, idx) => {
    for (let i = 0; i < board.quantity; i++) {
      allBoards.push({ board, originalIndex: idx });
    }
  });

  // Sort by area descending (larger boards first - better packing heuristic)
  allBoards.sort((a, b) => {
    const areaA = a.board.length * a.board.width;
    const areaB = b.board.length * b.board.width;
    return areaB - areaA;
  });

  const sheets: SheetLayout[] = [];
  let currentSheet = new Sheet(SHEET_LENGTH, SHEET_WIDTH);
  const placedBoards: PlacedBoard[] = [];

  for (const { board } of allBoards) {
    const result = currentSheet.placeBoard(
      board.length,
      board.width,
      !!board.rotationAllowed
    );
    
    if (result) {
      placedBoards.push({
        board,
        x: result.position.x,
        y: result.position.y,
        rotated: result.rotated,
      });
    } else {
      // Current sheet is full, start a new sheet
      if (placedBoards.length > 0) {
        sheets.push({
          boards: placedBoards.slice(),
          waste: currentSheet.calculateWaste(),
        });
      }
      
      currentSheet = new Sheet(SHEET_LENGTH, SHEET_WIDTH);
      placedBoards.length = 0;
      
      // Try to place on the new sheet
      const newResult = currentSheet.placeBoard(
        board.length,
        board.width,
        !!board.rotationAllowed
      );
      if (newResult) {
        placedBoards.push({
          board,
          x: newResult.position.x,
          y: newResult.position.y,
          rotated: newResult.rotated,
        });
      }
    }
  }

  // Add the final sheet if it has any boards
  if (placedBoards.length > 0) {
    sheets.push({
      boards: placedBoards,
      waste: currentSheet.calculateWaste(),
    });
  }

  // Calculate statistics
  const totalBoardsPlaced = sheets.reduce((sum, sheet) => sum + sheet.boards.length, 0);
  const totalWaste = sheets.reduce((sum, sheet) => sum + sheet.waste, 0);
  const boardsPerSheet = sheets.map(sheet => sheet.boards.length);

  return {
    sheets,
    totalBoardsPlaced,
    totalWaste,
    boardsPerSheet,
  };
}
