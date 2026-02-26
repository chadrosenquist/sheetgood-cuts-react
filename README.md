# 🪵 SheetGood Cuts

A React application for optimizing plywood cutting layouts. SheetGood Cuts helps woodworkers and contractors figure out the best way to arrange their cut list on 4' x 8' sheets of plywood to minimize waste.

## Features

- **Cut List Management**: Add, edit, and manage your list of pieces with dimensions (length × width × depth) and quantities
- **Intelligent Optimization**: Uses a bottom-left heuristic packing algorithm to efficiently arrange pieces on sheets
- **Visual Layout**: See exactly how each piece will be arranged on the plywood sheet with an interactive visualization
- **Rotation Support**: Automatically rotates pieces when it helps fit them better on the sheet
- **Material Efficiency**: Calculate material efficiency percentage to see how well you're using your plywood
- **Cost Estimation**: Quick material cost calculation based on sheet count
- **Sheet Navigation**: View each sheet individually and see detailed breaking down of piece placement
- **Print-Friendly**: Get a detailed cut summary for each sheet with precise dimensions and positions

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd sheetgood-cuts-react
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

## How to Use

1. **Add Your Pieces**: 
   - Enter the name, length, width, depth (optional), and quantity for each piece
   - Click "Add" to add it to your cut list

2. **View Optimization Results**:
   - The app automatically calculates the optimal arrangement
   - See the number of sheets required and material efficiency percentage

3. **Explore Sheet Layouts**:
   - Use "Previous" and "Next" buttons to navigate through sheets
   - Click on a sheet in the breakdown grid to jump to it
   - Pieces marked with "R" are rotated for better fit

4. **Cut Summary**:
   - Each sheet shows a detailed list of pieces
   - Positions are given in inches from the bottom-left corner
   - Rotation information indicates which pieces are turned 90 degrees

### Understanding the Display

- **Material Efficiency**: The percentage of the sheet that is actually used (higher = better)
- **Waste**: The unused portion of plywood that will be scrap
- **Color-Coded Pieces**: Different piece types are shown in different colors on the visualization
- **Grid Lines**: Shown every 12 inches for reference (3 feet)

## Technical Details

### Packing Algorithm

The application uses a **Bottom-Left Heuristic** algorithm:

1. Pieces are sorted by area (largest first) for better initial placement
2. For each piece, the algorithm tries to place it at the lowest available position
3. If a piece doesn't fit in its original orientation, it's rotated 90 degrees
4. When a piece can't fit on the current sheet, a new sheet is created

This heuristic typically achieves 70-85% material efficiency for typical woodworking projects.

### Dimensions

- Sheet Size: 4' × 8' (48" × 96") approximately 4,608 square inches
- All measurements are in inches
- The 96" dimension is shown on the X-axis (length of sheet)
- The 48" dimension is shown on the Y-axis (width of sheet)

## Project Structure

```
src/
├── App.tsx                 # Main application component
├── App.css                 # Application styling
├── types.ts                # TypeScript type definitions
├── packing.ts              # Packing algorithm implementation
├── components/
│   ├── CutListForm.tsx     # Form for managing cut list
│   ├── CutListForm.css     # Cut list form styling
│   ├── SheetVisualization.tsx   # Sheet visualization component
│   └── SheetVisualization.css   # Visualization styling
├── index.css               # Global styles
└── main.tsx                # Application entry point
```

## Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **CSS3**: Styling and layout

## Future Enhancements

- [ ] Custom sheet sizes
- [ ] Saw kerf (blade thickness) compensation
- [ ] Save/load cut lists
- [ ] Material cost database
- [ ] Multiple optimization strategies
- [ ] Export to PDF/CAM formats
- [ ] Collab mode for sharing plans

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on the repository.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
