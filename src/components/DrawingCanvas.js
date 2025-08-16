import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(width * 0.5, 400);

const DrawingCanvas = React.forwardRef(({ onSave, brushWidth = 5 }, ref) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState('draw'); // 'draw', 'erase', or 'fill'
  const [fillAreas, setFillAreas] = useState([]); // Store filled regions

  const colors = [
    '#000000', // Black (main outline)
    '#FF0000', // Red (fill color)
    '#FFFFFF', // White (eraser for holes)
  ];

  const onTouchStart = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    
    if (drawMode === 'fill') {
      // Handle bucket fill
      handleFillArea(locationX, locationY);
    } else {
      // Handle drawing/erasing
      const newPath = `M${locationX},${locationY}`;
      setCurrentPath(newPath);
      setIsDrawing(true);
    }
  };

  const onTouchMove = (evt) => {
    if (!isDrawing || drawMode === 'fill') return;
    const { locationX, locationY } = evt.nativeEvent;
    setCurrentPath(prevPath => `${prevPath} L${locationX},${locationY}`);
  };

  const onTouchEnd = () => {
    if (drawMode === 'fill') return;
    
    setIsDrawing(false);
    if (currentPath && currentPath.length > 0) {
      setPaths(prevPaths => [...prevPaths, { 
        path: currentPath, 
        color: drawMode === 'erase' ? '#FFFFFF' : currentColor,
        width: brushWidth,
        mode: drawMode,
        isEraser: drawMode === 'erase'
      }]);
      setCurrentPath('');
    }
  };

  const handleFillArea = (x, y) => {
    // Find the enclosed region by tracing from the click point
    const fillPath = findEnclosedPath(x, y);
    if (fillPath) {
      setFillAreas(prev => [...prev, {
        path: fillPath,
        color: currentColor === '#000000' ? '#FF0000' : currentColor,
        clickPoint: { x, y }
      }]);
    }
  };

  const findEnclosedPath = (clickX, clickY) => {
    // Get all black outline paths
    const outlinePaths = paths.filter(p => p.color === '#000000' && !p.isEraser);
    if (outlinePaths.length === 0) return null;

    // Combine all outline paths into a single boundary
    let combinedPath = '';
    outlinePaths.forEach(p => {
      combinedPath += p.path + ' ';
    });

    // Try to create a fill polygon by flood-fill simulation
    // This is a simplified approach - trace the nearest boundaries
    const fillPoints = traceBoundaryFromPoint(clickX, clickY, outlinePaths);
    
    if (fillPoints && fillPoints.length > 0) {
      // Create a path from the boundary points
      let fillPath = `M${fillPoints[0].x},${fillPoints[0].y}`;
      for (let i = 1; i < fillPoints.length; i++) {
        fillPath += ` L${fillPoints[i].x},${fillPoints[i].y}`;
      }
      fillPath += ' Z';
      return fillPath;
    }

    // Fallback: Create a small fill area around the click point
    // This will be replaced with proper boundary detection
    return createBoundedFillArea(clickX, clickY, outlinePaths);
  };

  const traceBoundaryFromPoint = (x, y, outlinePaths) => {
    // Simplified boundary tracing
    // In a real implementation, you'd use a proper contour tracing algorithm
    const points = [];
    const step = 10; // Sampling step
    const radius = 100; // Search radius
    
    // Sample points in a circle around the click point
    // and find where they intersect with black paths
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
      let found = false;
      for (let r = 5; r < radius; r += step) {
        const testX = x + Math.cos(angle) * r;
        const testY = y + Math.sin(angle) * r;
        
        // Check if this point is near a black path
        if (isNearPath(testX, testY, outlinePaths)) {
          points.push({ x: testX, y: testY });
          found = true;
          break;
        }
      }
      
      // If no boundary found in this direction, extend to canvas edge
      if (!found) {
        const edgeX = x + Math.cos(angle) * radius;
        const edgeY = y + Math.sin(angle) * radius;
        points.push({ x: edgeX, y: edgeY });
      }
    }
    
    return points;
  };

  const isNearPath = (x, y, paths) => {
    // Check if a point is near any of the paths
    // This is simplified - in production you'd use proper path intersection
    const threshold = 10;
    
    for (const pathObj of paths) {
      // Parse the path and check proximity
      const pathPoints = parsePathToPoints(pathObj.path);
      for (const point of pathPoints) {
        const distance = Math.sqrt(
          Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
        );
        if (distance < threshold) {
          return true;
        }
      }
    }
    return false;
  };

  const parsePathToPoints = (pathString) => {
    // Parse SVG path string to extract points
    const points = [];
    const matches = pathString.match(/([ML])\s*(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g) || [];
    
    matches.forEach(match => {
      const coords = match.match(/(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/);
      if (coords) {
        points.push({
          x: parseFloat(coords[1]),
          y: parseFloat(coords[2])
        });
      }
    });
    
    return points;
  };

  const createBoundedFillArea = (x, y, outlinePaths) => {
    // Create a more intelligent fill based on nearby boundaries
    // Find the nearest path points in each direction
    const boundaryPoints = [];
    const directions = 16; // Number of rays to cast
    const maxDistance = 200;
    
    for (let i = 0; i < directions; i++) {
      const angle = (i / directions) * Math.PI * 2;
      let nearestPoint = null;
      let nearestDistance = maxDistance;
      
      // Cast a ray in this direction and find the nearest black path
      for (let d = 5; d < maxDistance; d += 2) {
        const testX = x + Math.cos(angle) * d;
        const testY = y + Math.sin(angle) * d;
        
        // Check if we hit a boundary
        if (isNearPath(testX, testY, outlinePaths)) {
          nearestPoint = { x: testX, y: testY };
          nearestDistance = d;
          break;
        }
      }
      
      // Add the boundary point or a default distance point
      if (nearestPoint) {
        boundaryPoints.push(nearestPoint);
      } else {
        // No boundary found, use a moderate distance
        boundaryPoints.push({
          x: x + Math.cos(angle) * 50,
          y: y + Math.sin(angle) * 50
        });
      }
    }
    
    // Create a path from the boundary points
    if (boundaryPoints.length > 0) {
      let path = `M${boundaryPoints[0].x},${boundaryPoints[0].y}`;
      for (let i = 1; i < boundaryPoints.length; i++) {
        path += ` L${boundaryPoints[i].x},${boundaryPoints[i].y}`;
      }
      path += ' Z';
      return path;
    }
    
    return null;
  };

  const clearCanvas = () => {
    setPaths([]);
    setFillAreas([]);
    setCurrentPath('');
    setIsDrawing(false);
  };

  const undoLastAction = () => {
    // Determine what was added last
    if (fillAreas.length > 0 && 
        (paths.length === 0 || fillAreas.length > paths.length)) {
      setFillAreas(prev => prev.slice(0, -1));
    } else if (paths.length > 0) {
      setPaths(prevPaths => prevPaths.slice(0, -1));
    }
  };

  const captureCanvas = async () => {
    // Process paths to create proper font outline
    const processedPaths = processPaths(paths, fillAreas);
    onSave(processedPaths);
    clearCanvas();
  };

  const processPaths = (allPaths, allFills) => {
    // Separate paths by their purpose
    const outlinePaths = [];
    const fillPaths = [];
    const eraserPaths = [];
    
    allPaths.forEach(p => {
      if (p.isEraser || p.color === '#FFFFFF') {
        eraserPaths.push(p);
      } else if (p.color === '#000000') {
        outlinePaths.push(p);
      } else if (p.color === '#FF0000') {
        fillPaths.push(p);
      } else {
        outlinePaths.push(p);
      }
    });

    // Add bucket fills to fill paths
    allFills.forEach(fill => {
      fillPaths.push({
        path: fill.path,
        color: fill.color,
        isFill: true
      });
    });
    
    return {
      outline: outlinePaths,
      fill: fillPaths,
      holes: eraserPaths,
      raw: allPaths
    };
  };

  React.useImperativeHandle(ref, () => ({
    clearCanvas,
    captureCanvas,
    undoLastAction
  }));

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.toolGroup}>
          <TouchableOpacity
            style={[styles.toolButton, drawMode === 'draw' && styles.toolButtonActive]}
            onPress={() => setDrawMode('draw')}
          >
            <Text style={styles.toolIcon}>✏️</Text>
            <Text style={styles.toolLabel}>Draw</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, drawMode === 'fill' && styles.toolButtonActive]}
            onPress={() => setDrawMode('fill')}
          >
            <Text style={styles.toolIcon}>🪣</Text>
            <Text style={styles.toolLabel}>Fill</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolButton, drawMode === 'erase' && styles.toolButtonActive]}
            onPress={() => setDrawMode('erase')}
          >
            <Text style={styles.toolIcon}>🧹</Text>
            <Text style={styles.toolLabel}>Erase</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={undoLastAction}
          >
            <Text style={styles.toolIcon}>↩️</Text>
            <Text style={styles.toolLabel}>Undo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toolGroup}>
          {colors.slice(0, 2).map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                currentColor === color && styles.colorButtonActive
              ]}
              onPress={() => {
                setCurrentColor(color);
                if (color === '#000000') {
                  setDrawMode('draw');
                }
              }}
            />
          ))}
        </View>

        <View style={styles.modeIndicator}>
          <Text style={styles.modeText}>
            {drawMode === 'erase' ? '🧹 Erasing' : 
             drawMode === 'fill' ? '🪣 Filling' : '✏️ Drawing'}
          </Text>
          <View style={[styles.colorIndicator, { backgroundColor: currentColor }]} />
        </View>
      </View>

      <View style={styles.canvasWrapper}>
        <View style={styles.canvas}>
          <View 
            style={styles.canvasBackground}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => drawMode !== 'fill'}
            onResponderGrant={onTouchStart}
            onResponderMove={onTouchMove}
            onResponderRelease={onTouchEnd}
            onResponderTerminate={onTouchEnd}
          >
            <Svg 
              style={StyleSheet.absoluteFillObject}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
            >
              {/* Render fill areas first (behind strokes) */}
              {fillAreas.map((fill, index) => (
                <Path
                  key={`fill-${index}`}
                  d={fill.path}
                  fill={fill.color}
                  fillOpacity={0.6}
                  stroke="none"
                />
              ))}
              
              {/* Render paths on top */}
              {paths.map((p, index) => {
                if (p.isEraser) {
                  return (
                    <Path
                      key={index}
                      d={p.path}
                      stroke="#FFFFFF"
                      strokeWidth={p.width * 3}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                } else {
                  return (
                    <Path
                      key={index}
                      d={p.path}
                      stroke={p.color}
                      strokeWidth={p.width}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={p.color === '#FF0000' ? 0.7 : 1}
                    />
                  );
                }
              })}
              
              {/* Current path being drawn */}
              {currentPath && currentPath.length > 0 && drawMode !== 'fill' && (
                <Path
                  d={currentPath}
                  stroke={drawMode === 'erase' ? '#FFFFFF' : currentColor}
                  strokeWidth={drawMode === 'erase' ? brushWidth * 3 : brushWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={currentColor === '#FF0000' ? 0.7 : 1}
                />
              )}
            </Svg>
          </View>
        </View>
        
        <View style={styles.guidelines}>
          <View style={styles.baselineGuide} />
          <View style={styles.capHeightGuide} />
          <View style={styles.xHeightGuide} />
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Tools Guide:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#000000' }]} />
            <Text style={styles.legendText}>Black = Outline</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF0000' }]} />
            <Text style={styles.legendText}>Red = Fill/Color</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🪣</Text>
            <Text style={styles.legendText}>Fill = Auto detect</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🧹</Text>
            <Text style={styles.legendText}>Eraser = Holes</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  toolGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  toolButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 50,
  },
  toolButtonActive: {
    backgroundColor: '#000000',
  },
  toolIcon: {
    fontSize: 20,
  },
  toolLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
    color: '#000000',
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  colorButtonActive: {
    borderWidth: 4,
    borderColor: '#000000',
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  canvasWrapper: {
    position: 'relative',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  canvasBackground: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#FFFFFF',
  },
  guidelines: {
    position: 'absolute',
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    pointerEvents: 'none',
  },
  baselineGuide: {
    position: 'absolute',
    bottom: CANVAS_SIZE * 0.25,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 150, 255, 0.2)',
  },
  capHeightGuide: {
    position: 'absolute',
    top: CANVAS_SIZE * 0.25,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 150, 255, 0.15)',
  },
  xHeightGuide: {
    position: 'absolute',
    top: CANVAS_SIZE * 0.4,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 150, 255, 0.1)',
    borderStyle: 'dashed',
  },
  legend: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    color: '#000000',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderColor: '#000000',
  },
  legendIcon: {
    fontSize: 12,
    width: 12,
    textAlign: 'center',
  },
  legendText: {
    fontSize: 9,
    color: '#666666',
  },
});

export { DrawingCanvas, CANVAS_SIZE };