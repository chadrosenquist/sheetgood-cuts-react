// Board dimensions in inches
export interface Board {
  id: string;
  length: number;  // in inches
  width: number;   // in inches
  depth: number;   // in inches
  quantity: number;
  name?: string;
}

// Placed board on a sheet
export interface PlacedBoard {
  board: Board;
  x: number;  // position on sheet in inches
  y: number;  // position on sheet in inches
  rotated: boolean; // whether it's rotated 90 degrees
}

// A single sheet layout
export interface SheetLayout {
  boards: PlacedBoard[];
  waste: number; // unused area in square inches
}

// Overall optimization result
export interface OptimizationResult {
  sheets: SheetLayout[];
  totalBoardsPlaced: number;
  totalWaste: number;
  boardsPerSheet: number[];
}

// Dimensions in inches
export const SHEET_LENGTH = 96; // 8 feet
export const SHEET_WIDTH = 48;  // 4 feet
