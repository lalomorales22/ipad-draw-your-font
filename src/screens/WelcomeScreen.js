import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.title}>Font Creator</Text>
          <Text style={styles.subtitle}>Design Your Custom Handwritten Font</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How It Works</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Draw each character with your Apple Pencil</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Complete all letters, numbers & symbols</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Generate & install your custom font</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('Drawing')}
          activeOpacity={0.9}
        >
          <Text style={styles.startButtonText}>Start Creating</Text>
        </TouchableOpacity>
        
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>✏️</Text>
          <Text style={styles.tipText}>Use Apple Pencil for best results</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#000000',
    padding: 32,
    marginBottom: 40,
    width: width * 0.6,
    maxWidth: 600,
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
  },
  steps: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    backgroundColor: '#000000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 64,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginBottom: 32,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 12,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
});

export default WelcomeScreen;