import React, { useState } from 'react';
import type { Board } from '../types';
import './CutListForm.css';

interface CutListFormProps {
  onBoardsUpdated: (boards: Board[]) => void;
}

export const CutListForm: React.FC<CutListFormProps> = ({ onBoardsUpdated }) => {
  const [boards, setBoards] = useState<Board[]>([
    { id: '1', length: 24, width: 12, depth: 1, quantity: 4, name: 'Side Panels' },
    { id: '2', length: 48, width: 12, depth: 1, quantity: 2, name: 'Top/Bottom' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    length: '',
    width: '',
    depth: '',
    quantity: '',
  });

  const handleAddBoard = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.length || !formData.width || !formData.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    const newBoard: Board = {
      id: Date.now().toString(),
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      depth: parseFloat(formData.depth) || 1,
      quantity: parseInt(formData.quantity),
      name: formData.name || `Board ${boards.length + 1}`,
    };

    const updatedBoards = [...boards, newBoard];
    setBoards(updatedBoards);
    onBoardsUpdated(updatedBoards);
    setFormData({ name: '', length: '', width: '', depth: '', quantity: '' });
  };

  const handleRemoveBoard = (id: string) => {
    const updatedBoards = boards.filter(b => b.id !== id);
    setBoards(updatedBoards);
    onBoardsUpdated(updatedBoards);
  };

  const handleUpdateBoard = (id: string, field: keyof Board, value: any) => {
    const updatedBoards = boards.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    );
    setBoards(updatedBoards);
    onBoardsUpdated(updatedBoards);
  };

  return (
    <div className="cut-list-form">
      <h2>Cut List</h2>
      
      <form onSubmit={handleAddBoard} className="add-board-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Board Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Length (in)"
            value={formData.length}
            onChange={(e) => setFormData({ ...formData, length: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="number"
            placeholder="Width (in)"
            value={formData.width}
            onChange={(e) => setFormData({ ...formData, width: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="number"
            placeholder="Depth (in)"
            value={formData.depth}
            onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="form-input"
            min="1"
            required
          />
          <button type="submit" className="btn-add">Add</button>
        </div>
      </form>

      <div className="boards-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Length (in)</th>
              <th>Width (in)</th>
              <th>Depth (in)</th>
              <th>Qty</th>
              <th>Total Area (sq in)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {boards.map(board => (
              <tr key={board.id}>
                <td>
                  <input
                    type="text"
                    value={board.name || ''}
                    onChange={(e) => handleUpdateBoard(board.id, 'name', e.target.value)}
                    className="inline-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={board.length}
                    onChange={(e) => handleUpdateBoard(board.id, 'length', parseFloat(e.target.value))}
                    className="inline-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={board.width}
                    onChange={(e) => handleUpdateBoard(board.id, 'width', parseFloat(e.target.value))}
                    className="inline-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={board.depth}
                    onChange={(e) => handleUpdateBoard(board.id, 'depth', parseFloat(e.target.value))}
                    className="inline-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={board.quantity}
                    onChange={(e) => handleUpdateBoard(board.id, 'quantity', parseInt(e.target.value))}
                    className="inline-input"
                    min="1"
                  />
                </td>
                <td>{(board.length * board.width * board.quantity).toFixed(0)}</td>
                <td>
                  <button
                    onClick={() => handleRemoveBoard(board.id)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
