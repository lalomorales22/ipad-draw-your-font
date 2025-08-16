# Font Creator - iPad App
<img width="1620" height="2160" alt="IMG_0009" src="https://github.com/user-attachments/assets/16b1deab-e081-4d41-ac4e-bd2d1419adaf" />
<img width="1620" height="2160" alt="IMG_0008" src="https://github.com/user-attachments/assets/27dd7619-4162-4522-afd4-a6009d6eef66" />


A React Native Expo application that allows users to create custom handwritten fonts using their iPad and Apple Pencil.

## Features

- 🎨 **Handwritten Font Creation** - Draw each character with Apple Pencil
- 📝 **Complete Character Set** - Supports A-Z, a-z, 0-9, and special characters
- 📊 **Progress Tracking** - Visual progress bar shows completion status
- 💾 **Font Generation** - Creates real .otf font files
- 📤 **Export Functionality** - Share your custom fonts with other applications
- 🎯 **iPad Optimized** - Designed specifically for iPad in landscape mode

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iPad with Expo Go app installed
- Apple Pencil (recommended for best results)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd font-creator-app
```

2. Install dependencies:
```bash
npm install
```

## Running the App

1. Start the Expo development server:
```bash
npm start
```

2. Open Expo Go on your iPad
3. Scan the QR code displayed in the terminal
4. The app will launch in landscape mode

## Project Structure

```
font-creator-app/
├── App.js                    # Main app entry point with navigation
├── src/
│   ├── screens/
│   │   ├── WelcomeScreen.js     # Initial welcome screen
│   │   ├── DrawingScreen.js     # Character drawing interface
│   │   └── CompletionScreen.js  # Font generation and export
│   ├── components/
│   │   └── DrawingCanvas.js     # Canvas component for drawing
│   └── utils/
│       └── fontGenerator.js     # Font file generation logic
├── assets/                   # App icons and images
└── app.json                  # Expo configuration
```

## How to Use

1. **Welcome Screen**: Launch the app and tap "Start Drawing"
2. **Draw Characters**: Use your Apple Pencil to draw each character shown
3. **Navigation**: 
   - Tap "Next" to move to the next character
   - Tap "Previous" to go back
   - Tap "Clear" to redraw the current character
4. **Complete All Characters**: Draw all letters (A-Z, a-z), numbers (0-9), and special characters
5. **Generate Font**: After completing all characters, tap "Create Custom Font"
6. **Export**: Share your generated .otf font file with other applications

## Technologies Used

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Navigation** - Screen navigation
- **React Native SVG** - Drawing implementation
- **OpenType.js** - Font file generation
- **Expo Linear Gradient** - UI gradients
- **React Native Gesture Handler** - Touch interactions
- **Expo Sharing** - File sharing functionality

## Configuration

The app is configured for iPad in landscape mode. Key settings in `app.json`:
- Orientation: `landscape`
- iOS: `supportsTablet: true`
- Full screen mode enabled

## Development

To modify the character set, edit the `CHARACTERS` array in `src/screens/DrawingScreen.js`.

To adjust canvas size or drawing settings, modify `src/components/DrawingCanvas.js`.

## Building for Production

For iOS:
```bash
expo build:ios
```

For Android:
```bash
expo build:android
```

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Support

For issues and questions, please open an issue in the GitHub repository.
