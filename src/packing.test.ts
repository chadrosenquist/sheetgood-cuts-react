// @ts-nocheck
import { optimizePlacement } from './packing';
import type { Board } from './types';

describe('packing algorithm', () => {
  it('places a single board on one sheet', () => {
    const boards: Board[] = [{ id: '1', length: 48, width: 24, depth: 1, quantity: 1, rotationAllowed: true }];
    const result = optimizePlacement(boards);

    expect(result.sheets.length).toBe(1);
    expect(result.sheets[0].boards).toHaveLength(1);
    expect(result.unplaced).toHaveLength(0);
  });

  it('rotates a board when useful and allowed', () => {
    // board fits only when rotated: 40x60 requires rotation to have width<=48
    const boards: Board[] = [{ id: '2', length: 40, width: 60, depth: 1, quantity: 1, rotationAllowed: true }];

    const result = optimizePlacement(boards);
    expect(result.unplaced).toHaveLength(0);
    expect(result.sheets[0].boards[0].rotated).toBe(true);
  });

  it('does not rotate when rotationAllowed is false', () => {
    const boards: Board[] = [
      { id: '3', length: 50, width: 49, depth: 1, quantity: 1, rotationAllowed: false },
    ];
    const result = optimizePlacement(boards);
    expect(result.unplaced).toHaveLength(1);
  });

  it('splits boards across multiple sheets', () => {
    const boards: Board[] = [];
    for (let i = 0; i < 20; i++) {
      boards.push({ id: `b${i}`, length: 24, width: 24, depth: 1, quantity: 1, rotationAllowed: true });
    }
    const result = optimizePlacement(boards);
    expect(result.sheets.length).toBeGreaterThan(1);
    expect(result.totalBoardsPlaced).toBe(20);
    expect(result.unplaced).toHaveLength(0);
  });

  it('marks extremely large pieces as unplaced', () => {
    const boards: Board[] = [
      { id: 'huge', length: 200, width: 200, depth: 1, quantity: 1, rotationAllowed: true },
    ];
    const result = optimizePlacement(boards);
    expect(result.sheets.length).toBe(0);
    expect(result.unplaced).toEqual(boards);
  });

  it('respects custom sheet size passed in', () => {
    const boards: Board[] = [
      { id: 'big', length: 60, width: 36, depth: 1, quantity: 1, rotationAllowed: true },
    ];
    // default sheet is 96x48 so this board would fit if rotated
    const defaultResult = optimizePlacement(boards);
    expect(defaultResult.unplaced.length).toBe(0);

    // use a small sheet that cannot accommodate the piece even rotated
    const smallResult = optimizePlacement(boards, 50, 40);
    expect(smallResult.unplaced.length).toBe(1);
  });
});
