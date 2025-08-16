import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Font from 'expo-font';

const { width, height } = Dimensions.get('window');

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "Hello, World! This is my custom font.",
  "Design is not just what it looks like and feels like.",
];

const FontPreviewScreen = ({ route, navigation }) => {
  const { fontFileUri, savedCharacters } = route.params;
  const [customText, setCustomText] = useState(SAMPLE_TEXTS[0]);
  const [fontSize, setFontSize] = useState(24);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [customFontFamily, setCustomFontFamily] = useState(null);

  useEffect(() => {
    loadCustomFont();
  }, [fontFileUri]);

  const loadCustomFont = async () => {
    try {
      const fontName = 'CustomHandwritten-' + Date.now();
      await Font.loadAsync({
        [fontName]: fontFileUri
      });
      setCustomFontFamily(fontName);
      setFontLoaded(true);
    } catch (error) {
      console.error('Error loading custom font for preview:', error);
    }
  };

  const installFont = async () => {
    try {
      const fontData = await FileSystem.readAsStringAsync(fontFileUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const fontPayloadUUID = generateUUID();
      const profilePayloadUUID = generateUUID();

      // Properly formatted configuration profile for iOS
      const mobileConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>Font</key>
            <data>
${fontData}
            </data>
            <key>PayloadDescription</key>
            <string>Adds a custom font to iOS</string>
            <key>PayloadDisplayName</key>
            <string>CustomHandwritten Font</string>
            <key>PayloadIdentifier</key>
            <string>com.fontcreator.font.${fontPayloadUUID}</string>
            <key>PayloadType</key>
            <string>com.apple.font</string>
            <key>PayloadUUID</key>
            <string>${fontPayloadUUID}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Install CustomHandwritten font on your device</string>
    <key>PayloadDisplayName</key>
    <string>CustomHandwritten Font</string>
    <key>PayloadIdentifier</key>
    <string>com.fontcreator.profile.${profilePayloadUUID}</string>
    <key>PayloadOrganization</key>
    <string>Font Creator App</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${profilePayloadUUID}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

      const profilePath = `${FileSystem.documentDirectory}CustomHandwritten.mobileconfig`;
      await FileSystem.writeAsStringAsync(profilePath, mobileConfig, {
        encoding: FileSystem.EncodingType.UTF8
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(profilePath, {
          mimeType: 'application/x-apple-aspen-config',
          dialogTitle: 'Install Font Profile',
          UTI: 'com.apple.mobileconfig'
        });
        
        setTimeout(() => {
          Alert.alert(
            '📱 Installation Steps',
            '1. Tap "Save to Files" in the share sheet\n' +
            '2. Remember where you saved it\n' +
            '3. Open the Files app\n' +
            '4. Find and tap the .mobileconfig file\n' +
            '5. You\'ll see "Profile Downloaded" notification\n' +
            '6. Go to Settings → General → VPN & Device Management\n' +
            '7. Under "Downloaded Profile" tap the font profile\n' +
            '8. Tap "Install" and enter your passcode\n\n' +
            'Your font will then be available as "CustomHandwritten" in supported apps!',
            [{ text: 'Got it!', style: 'default' }]
          );
        }, 500);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create font installation profile');
    }
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16).toUpperCase();
    });
  };

  const shareFont = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fontFileUri, {
          mimeType: 'font/otf',
          dialogTitle: 'Share Font File',
          UTI: 'public.opentype-font'
        });
      }
    } catch (error) {
      console.error('Error sharing font:', error);
      Alert.alert('Error', 'Failed to share font file');
    }
  };

  const getPreviewTextStyle = () => {
    if (fontLoaded && customFontFamily) {
      return {
        fontFamily: customFontFamily,
        fontSize: fontSize,
        color: '#000000',
        lineHeight: fontSize * 1.5
      };
    }
    return {
      fontSize: fontSize,
      color: '#666666',
      fontStyle: 'italic',
      lineHeight: fontSize * 1.5
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Preview Your Font</Text>
          <Text style={styles.subtitle}>
            {fontLoaded ? 'Your custom font is ready!' : 'Loading font...'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Font Preview</Text>
            <View style={styles.fontSizeControls}>
              <Text style={styles.sizeLabel}>{fontSize}px</Text>
              <View style={styles.sizeButtons}>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => setFontSize(Math.max(12, fontSize - 4))}
                >
                  <Text style={styles.sizeButtonText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => setFontSize(Math.min(72, fontSize + 4))}
                >
                  <Text style={styles.sizeButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.previewBox}>
            <Text style={getPreviewTextStyle()}>
              {customText}
            </Text>
          </View>

          <TextInput
            style={styles.textInput}
            value={customText}
            onChangeText={setCustomText}
            multiline
            placeholder="Type to test your font..."
            placeholderTextColor="#999999"
          />

          <View style={styles.samples}>
            {SAMPLE_TEXTS.map((text, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sampleChip}
                onPress={() => setCustomText(text)}
              >
                <Text style={styles.sampleText} numberOfLines={1}>
                  {text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Character Set</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.charScroll}
          >
            <View style={styles.charGrid}>
              {Object.keys(savedCharacters).map((char, index) => (
                <View key={index} style={styles.charBox}>
                  <Text style={[
                    styles.charPreview, 
                    fontLoaded && { fontFamily: customFontFamily }
                  ]}>
                    {char}
                  </Text>
                  <Text style={styles.charLabel}>{char}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={installFont}
          >
            <Text style={styles.primaryButtonText}>Install on Device</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={shareFont}
          >
            <Text style={styles.secondaryButtonText}>Export .OTF File</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton, { flex: 1 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.outlineButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.outlineButton, { flex: 1 }]}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.outlineButtonText}>New Font</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Installation Help</Text>
          <Text style={styles.helpText}>
            After tapping "Install on Device":{'\n\n'}
            1. Save the .mobileconfig file to Files app{'\n'}
            2. Open Files and tap the saved profile{'\n'}
            3. Check Settings for "Profile Downloaded"{'\n'}
            4. Go to Settings → General → VPN & Device Management{'\n'}
            5. Install the profile with your passcode{'\n\n'}
            Font name: "CustomHandwritten"
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000000',
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    minWidth: 40,
    textAlign: 'right',
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  sizeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20,
  },
  previewBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 20,
    minHeight: 120,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 16,
    fontSize: 16,
    color: '#000000',
    minHeight: 80,
    marginBottom: 16,
  },
  samples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleChip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '48%',
  },
  sampleText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  charScroll: {
    marginTop: 16,
    marginHorizontal: -8,
  },
  charGrid: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 12,
  },
  charBox: {
    width: 72,
    height: 72,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  charPreview: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  charLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
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
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  outlineButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  helpCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
    padding: 20,
    marginTop: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default FontPreviewScreen;