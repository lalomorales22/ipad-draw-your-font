import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { DrawingCanvas, CANVAS_SIZE } from '../components/DrawingCanvas';

const { width, height } = Dimensions.get('window');

const CHARACTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '!', '?', '.', ',', ';', ':', "'", '"', '-', '_', '(', ')', '[', ']', '{', '}',
  '@', '#', '$', '%', '&', '*', '+', '=', '/', '\\'
];

const DrawingScreen = ({ navigation }) => {
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [savedCharacters, setSavedCharacters] = useState({});
  const [brushWidth, setBrushWidth] = useState(5);
  const canvasRef = useRef();

  const currentChar = CHARACTERS[currentCharIndex];
  const progress = ((currentCharIndex + 1) / CHARACTERS.length) * 100;

  const handleSave = async (pathData) => {
    const newSavedCharacters = { ...savedCharacters, [currentChar]: pathData };
    setSavedCharacters(newSavedCharacters);

    if (currentCharIndex < CHARACTERS.length - 1) {
      setCurrentCharIndex(currentCharIndex + 1);
    } else {
      navigation.navigate('Completion', { savedCharacters: newSavedCharacters });
    }
  };

  const handleNext = () => {
    if (canvasRef.current) {
      canvasRef.current.captureCanvas();
    }
  };

  const handlePrevious = () => {
    if (currentCharIndex > 0) {
      setCurrentCharIndex(currentCharIndex - 1);
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Font</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Character {currentCharIndex + 1} of {CHARACTERS.length}
            </Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.workArea}>
          {/* Left Panel */}
          <View style={styles.leftPanel}>
            <View style={styles.characterCard}>
              <Text style={styles.characterLabel}>Draw this character</Text>
              <View style={styles.characterDisplay}>
                <Text style={styles.character}>{currentChar}</Text>
              </View>
            </View>

            <View style={styles.brushCard}>
              <Text style={styles.brushTitle}>Brush Size</Text>
              <View style={styles.brushOptions}>
                {[
                  { size: 3, label: 'Thin' },
                  { size: 5, label: 'Medium' },
                  { size: 8, label: 'Thick' },
                  { size: 12, label: 'Bold' }
                ].map((brush) => (
                  <TouchableOpacity
                    key={brush.size}
                    style={[
                      styles.brushButton,
                      brushWidth === brush.size && styles.brushButtonActive
                    ]}
                    onPress={() => setBrushWidth(brush.size)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.brushDot, 
                      { 
                        width: brush.size * 2, 
                        height: brush.size * 2,
                        backgroundColor: brushWidth === brush.size ? '#FFFFFF' : '#000000'
                      }
                    ]} />
                    <Text style={[
                      styles.brushText,
                      brushWidth === brush.size && styles.brushTextActive
                    ]}>
                      {brush.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Canvas Area */}
          <View style={styles.canvasContainer}>
            <DrawingCanvas
              ref={canvasRef}
              onSave={handleSave}
              brushWidth={brushWidth}
            />
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton, currentCharIndex === 0 && styles.disabledButton]}
                onPress={handlePrevious}
                disabled={currentCharIndex === 0}
                activeOpacity={0.8}
              >
                <Text style={[styles.secondaryButtonText, currentCharIndex === 0 && styles.disabledButtonText]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={handleClear}
                activeOpacity={0.8}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {currentCharIndex === CHARACTERS.length - 1 ? 'Complete' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    maxWidth: 600,
    height: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  progressText: {
    color: '#666666',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
  workArea: {
    flex: 1,
    flexDirection: 'row',
    gap: 30,
  },
  leftPanel: {
    width: 220,
    gap: 20,
  },
  characterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000000',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  characterLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
    fontWeight: '600',
  },
  characterDisplay: {
    width: 140,
    height: 140,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  character: {
    fontSize: 80,
    fontWeight: '800',
    color: '#000000',
  },
  brushCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000000',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  brushTitle: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  brushOptions: {
    gap: 10,
  },
  brushButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 12,
    gap: 12,
  },
  brushButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  brushDot: {
    borderRadius: 50,
  },
  brushText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  brushTextActive: {
    color: '#FFFFFF',
  },
  canvasContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 3,
  },
  primaryButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF0000',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF0000',
  },
  disabledButton: {
    opacity: 0.3,
  },
  disabledButtonText: {
    opacity: 0.5,
  },
});

export default DrawingScreen;