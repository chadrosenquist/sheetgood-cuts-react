import React, { useState, useRef } from 'react';
import type { Board } from '../types';
import './CutListForm.css';

interface CutListFormProps {
  onBoardsUpdated: (boards: Board[]) => void;
}

export const CutListForm: React.FC<CutListFormProps> = ({ onBoardsUpdated }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const [formData, setFormData] = useState({
    name: '',
    length: '',
    width: '',
    depth: '',
    quantity: '',
    rotationAllowed: false,
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
      rotationAllowed: !!formData.rotationAllowed,
    };

    const updatedBoards = [...boards, newBoard];
    setBoards(updatedBoards);
    onBoardsUpdated(updatedBoards);
    setFormData({ name: '', length: '', width: '', depth: '', quantity: '', rotationAllowed: false });
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

  const handleClearList = () => {
    if (window.confirm('Are you sure you want to clear the entire cut list?')) {
      setBoards([]);
      onBoardsUpdated([]);
    }
  };

  const handleSaveList = () => {
    if (boards.length === 0) {
      alert('No boards to save. Add some boards first.');
      return;
    }

    const dataStr = JSON.stringify(boards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cut-list-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportList = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedBoards = JSON.parse(content);

        // Validate that it's an array of boards
        if (!Array.isArray(importedBoards)) {
          throw new Error('Invalid file format: expected an array of boards');
        }

        // Basic validation of board structure
        importedBoards.forEach((board: any) => {
          if (
            typeof board.id !== 'string' ||
            typeof board.length !== 'number' ||
            typeof board.width !== 'number' ||
            typeof board.quantity !== 'number'
          ) {
            throw new Error('Invalid board format in file');
          }
        });

        setBoards(importedBoards);
        onBoardsUpdated(importedBoards);
        alert('Cut list imported successfully!');
      } catch (error) {
        alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);

    // Reset the file input so the same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="cut-list-form">
      <div className="cut-list-header">
        <h2>Cut List</h2>
        <div className="header-buttons">
          <button onClick={handleSaveList} className="btn-save" title="Export cut list as JSON">
            💾 Save
          </button>
          <button onClick={handleImportClick} className="btn-import" title="Import cut list from JSON file">
            📂 Import
          </button>
          {boards.length > 0 && (
            <button onClick={handleClearList} className="btn-clear">
              Clear All
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportList}
        style={{ display: 'none' }}
      />
      
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
          <label className="rotate-checkbox">
            <input
              type="checkbox"
              checked={formData.rotationAllowed}
              onChange={(e) => setFormData({ ...formData, rotationAllowed: e.target.checked })}
            />
            Allow Rotation
          </label>
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
              <th>Rotate?</th>
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
                <td>
                  <input
                    type="checkbox"
                    checked={!!board.rotationAllowed}
                    onChange={(e) => handleUpdateBoard(board.id, 'rotationAllowed', e.target.checked)}
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
