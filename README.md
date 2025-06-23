# Simenium - Interactive 3D Educational Models

A collection of interactive 3D models for educational purposes, built with Three.js and hosted on GitHub Pages.

## 🚀 Live Demo

Visit the live site: [Your GitHub Pages URL]

## 🛠️ Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build CSS (for development):
   ```bash
   npm run build-css
   ```

4. Build CSS (for production):
   ```bash
   npm run build
   ```

### Local Development
1. Build the CSS first:
   ```bash
   npm run build
   ```

2. Serve the files using a local web server (required for loading 3D models):
   ```bash
   # Option 1: Using Python
   python -m http.server 8000
   
   # Option 2: Using Node.js
   npx serve .
   
   # Option 3: Using VS Code Live Server extension
   ```

3. Open `http://localhost:8000` in your browser

## 📁 Project Structure

```
├── index.html              # Main landing page
├── dist/                   # Built CSS files
├── src/                    # Source CSS files
├── [model-name]/           # Individual model directories
│   ├── index.html         # Model viewer page
│   ├── script.js          # Model-specific JavaScript
│   ├── style.css          # Model-specific styles
│   ├── thumbnail.png      # Preview image
│   └── models/            # 3D model files (.glb)
└── .github/workflows/     # GitHub Actions for deployment
```

## 🔧 Adding New Models

1. Create a new folder with your model name
2. Add the required files:
   - `index.html` (copy from existing model and modify)
   - `script.js` (configure for your specific models)
   - `style.css` (customize styling)
   - `thumbnail.png` (preview image)
   - `models/` folder with your `.glb` files

3. For models with multiple parts, create a `locations.json` file in the `models/` folder:
   ```json
   [
     {
       "name": "part1.glb",
       "from": [x, y, z],
       "to": [x, y, z]
     }
   ]
   ```

4. Update the main `index.html` to include your new model

## 🚀 Deployment

### Automatic Deployment (Recommended)
The project uses GitHub Actions for automatic deployment to GitHub Pages:

1. Push changes to the `main` branch
2. GitHub Actions will automatically:
   - Install dependencies
   - Build the CSS
   - Deploy to GitHub Pages

### Manual Deployment
1. Build the CSS:
   ```bash
   npm run build
   ```

2. Commit and push the built files:
   ```bash
   git add .
   git commit -m "Build CSS for deployment"
   git push origin main
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Tailwind CDN Warning**: 
   - Fixed: Using production-built CSS instead of CDN

2. **Missing Thumbnail Images**:
   - Ensure each model folder has a `thumbnail.png` file
   - Check file permissions and case sensitivity

3. **JSON Loading Errors**:
   - Verify `locations.json` syntax
   - Check file paths in `script.js`
   - The project includes fallback hardcoded locations

4. **Models Not Loading**:
   - Ensure you're serving from a web server (not file://)
   - Check console for CORS errors
   - Verify `.glb` file paths

### GitHub Pages Specific Issues

1. **Case Sensitivity**: GitHub Pages is case-sensitive. Ensure file names match exactly.

2. **Large Files**: Use Git LFS for large model files (already configured).

3. **MIME Types**: JSON files are configured for proper line endings.

## 📝 License

[Add your license information here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Build and test locally
5. Submit a pull request

## 📞 Support

If you encounter any issues, please check the browser console for error messages and refer to the troubleshooting section above.
