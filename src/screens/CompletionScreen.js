import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Share, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { createFontFromImages } from '../utils/fontGenerator';

const { width, height } = Dimensions.get('window');

const CompletionScreen = ({ route, navigation }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontFileUri, setFontFileUri] = useState(null);
  const { savedCharacters } = route.params;

  const generateFont = async () => {
    setIsGenerating(true);
    try {
      const fontUri = await createFontFromImages(savedCharacters);
      setFontFileUri(fontUri);
      Alert.alert(
        '✨ Success!',
        'Your custom font has been generated successfully.',
        [
          { 
            text: 'Preview & Install', 
            onPress: () => navigation.navigate('FontPreview', { 
              fontFileUri: fontUri, 
              savedCharacters 
            })
          },
          { text: 'Later', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error generating font:', error);
      Alert.alert(
        'Error',
        'Failed to generate font. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const shareFont = async () => {
    if (fontFileUri) {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fontFileUri, {
            mimeType: 'font/otf',
            dialogTitle: 'Share your custom font'
          });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device');
        }
      } catch (error) {
        console.error('Error sharing font:', error);
        Alert.alert('Error', 'Failed to share font file');
      }
    }
  };

  const startOver = () => {
    navigation.navigate('Welcome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          
          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.subtitle}>
            You've completed all {Object.keys(savedCharacters).length} characters
          </Text>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Object.keys(savedCharacters).length}</Text>
              <Text style={styles.statLabel}>Characters</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {!fontFileUri ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={generateFont}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.primaryButtonText}>Generating...</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Generate Font</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => navigation.navigate('FontPreview', { 
                  fontFileUri, 
                  savedCharacters 
                })}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Preview & Install</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={shareFont}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Export .OTF File</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={startOver}
                activeOpacity={0.8}
              >
                <Text style={styles.outlineButtonText}>Create Another</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {fontFileUri && (
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🎉</Text>
            <Text style={styles.infoTitle}>Your font is ready!</Text>
            <Text style={styles.infoText}>
              Install it on your device to use in any app that supports custom fonts.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#000000',
    padding: 40,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 50,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#000000',
    marginHorizontal: 20,
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
    maxWidth: 400,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  outlineButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCard: {
    marginTop: 32,
    padding: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
    width: width * 0.6,
    maxWidth: 500,
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
});

export default CompletionScreen;