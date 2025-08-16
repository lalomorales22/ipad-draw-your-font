import opentype from 'opentype.js';
import * as FileSystem from 'expo-file-system';

const GLYPH_SIZE = 1000;
const BASELINE = 700;
const ASCENDER = 800;
const DESCENDER = -200;

const processComplexPaths = (pathData) => {
  const fontPath = new opentype.Path();
  
  if (!pathData) {
    return createDefaultPath();
  }

  // Handle new structured path format
  if (pathData.outline || pathData.fill || pathData.holes) {
    return createComplexGlyph(pathData);
  }
  
  // Handle legacy array format
  if (Array.isArray(pathData)) {
    return svgPathsToFontPath(pathData);
  }
  
  // Handle raw paths
  if (pathData.raw) {
    return svgPathsToFontPath(pathData.raw);
  }
  
  return createDefaultPath();
};

const createComplexGlyph = (pathData) => {
  const fontPath = new opentype.Path();
  const scale = GLYPH_SIZE / 400;
  
  // Step 1: Process outline paths (black)
  const outlinePaths = pathData.outline || [];
  const fillPaths = pathData.fill || [];
  const holePaths = pathData.holes || [];
  
  // Combine all paths to create a proper glyph
  const allPaths = [];
  
  // Add main outline paths
  outlinePaths.forEach(p => {
    if (p.path) {
      allPaths.push({ 
        d: p.path, 
        type: 'outline',
        clockwise: true 
      });
    }
  });
  
  // Add hole paths (counter-clockwise for proper winding)
  holePaths.forEach(p => {
    if (p.path) {
      allPaths.push({ 
        d: p.path, 
        type: 'hole',
        clockwise: false 
      });
    }
  });
  
  // Process each path
  allPaths.forEach(pathInfo => {
    const commands = parsePathCommands(pathInfo.d);
    let firstPoint = null;
    let currentPoint = { x: 0, y: 0 };
    
    commands.forEach((cmd, index) => {
      const type = cmd.type;
      const coords = cmd.coords;
      
      switch(type) {
        case 'M':
          const mx = coords[0] * scale;
          const my = BASELINE - (coords[1] * scale);
          fontPath.moveTo(mx, my);
          firstPoint = { x: mx, y: my };
          currentPoint = { x: mx, y: my };
          break;
          
        case 'L':
          for (let i = 0; i < coords.length; i += 2) {
            const lx = coords[i] * scale;
            const ly = BASELINE - (coords[i + 1] * scale);
            fontPath.lineTo(lx, ly);
            currentPoint = { x: lx, y: ly };
          }
          break;
          
        case 'C':
          for (let i = 0; i < coords.length; i += 6) {
            fontPath.curveTo(
              coords[i] * scale,
              BASELINE - (coords[i + 1] * scale),
              coords[i + 2] * scale,
              BASELINE - (coords[i + 3] * scale),
              coords[i + 4] * scale,
              BASELINE - (coords[i + 5] * scale)
            );
            currentPoint = {
              x: coords[i + 4] * scale,
              y: BASELINE - (coords[i + 5] * scale)
            };
          }
          break;
          
        case 'Z':
          fontPath.closePath();
          if (firstPoint) {
            currentPoint = { ...firstPoint };
          }
          break;
      }
    });
    
    // Auto-close paths if not closed
    if (firstPoint && (currentPoint.x !== firstPoint.x || currentPoint.y !== firstPoint.y)) {
      fontPath.closePath();
    }
  });
  
  return fontPath;
};

const parsePathCommands = (pathString) => {
  const commands = [];
  const matches = pathString.match(/[MLCQZmlcqz][^MLCQZmlcqz]*/g) || [];
  
  matches.forEach(match => {
    const type = match[0].toUpperCase();
    const coordString = match.slice(1).trim();
    const coords = coordString.length > 0 
      ? coordString.split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
      : [];
    
    commands.push({ type, coords });
  });
  
  return commands;
};

const svgPathsToFontPath = (svgPaths) => {
  const fontPath = new opentype.Path();
  
  if (!svgPaths || svgPaths.length === 0) {
    return createDefaultPath();
  }
  
  svgPaths.forEach(pathData => {
    if (!pathData || !pathData.path) return;
    
    const commands = parsePathCommands(pathData.path);
    const scale = GLYPH_SIZE / 400;
    
    commands.forEach(cmd => {
      const type = cmd.type;
      const coords = cmd.coords;
      
      switch(type) {
        case 'M':
          if (coords.length >= 2) {
            fontPath.moveTo(
              coords[0] * scale,
              BASELINE - (coords[1] * scale)
            );
          }
          break;
          
        case 'L':
          for (let i = 0; i < coords.length; i += 2) {
            if (i + 1 < coords.length) {
              fontPath.lineTo(
                coords[i] * scale,
                BASELINE - (coords[i + 1] * scale)
              );
            }
          }
          break;
          
        case 'C':
          for (let i = 0; i < coords.length; i += 6) {
            if (i + 5 < coords.length) {
              fontPath.curveTo(
                coords[i] * scale,
                BASELINE - (coords[i + 1] * scale),
                coords[i + 2] * scale,
                BASELINE - (coords[i + 3] * scale),
                coords[i + 4] * scale,
                BASELINE - (coords[i + 5] * scale)
              );
            }
          }
          break;
          
        case 'Z':
          fontPath.closePath();
          break;
      }
    });
  });
  
  return fontPath;
};

const createDefaultPath = () => {
  const path = new opentype.Path();
  const margin = 50;
  const size = 600;
  
  // Create a simple rectangle as default
  path.moveTo(margin, BASELINE);
  path.lineTo(margin, BASELINE - size);
  path.lineTo(margin + size, BASELINE - size);
  path.lineTo(margin + size, BASELINE);
  path.closePath();
  
  return path;
};

const createFontFromImages = async (characterImages) => {
  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    advanceWidth: 650,
    path: new opentype.Path()
  });

  const glyphs = [notdefGlyph];
  const failedChars = [];
  
  for (const [char, imageData] of Object.entries(characterImages)) {
    try {
      const charCode = char.charCodeAt(0);
      let fontPath;
      
      // Process the path data based on its structure
      fontPath = processComplexPaths(imageData);
      
      const glyph = new opentype.Glyph({
        name: char,
        unicode: charCode,
        advanceWidth: 650,
        path: fontPath
      });
      
      glyphs.push(glyph);
    } catch (error) {
      console.error(`Error processing character "${char}":`, error);
      failedChars.push(char);
      
      // Add a default glyph for failed characters
      const glyph = new opentype.Glyph({
        name: char,
        unicode: char.charCodeAt(0),
        advanceWidth: 650,
        path: createDefaultPath()
      });
      glyphs.push(glyph);
    }
  }
  
  if (failedChars.length > 0) {
    console.log('Characters that failed processing:', failedChars.join(', '));
  }

  // Create the font
  const font = new opentype.Font({
    familyName: 'CustomHandwritten',
    styleName: 'Regular',
    unitsPerEm: GLYPH_SIZE,
    ascender: ASCENDER,
    descender: DESCENDER,
    glyphs: glyphs
  });

  // Generate font file
  const arrayBuffer = font.toArrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  const fontFileUri = `${FileSystem.documentDirectory}CustomHandwritten.otf`;
  await FileSystem.writeAsStringAsync(fontFileUri, base64, {
    encoding: FileSystem.EncodingType.Base64
  });
  
  console.log('Font file created at:', fontFileUri);
  return fontFileUri;
};

export { createFontFromImages };