# Assets Folder

This folder should contain the following image files for the app:

## Required Files:

### 1. icon.png
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Description**: Main app icon

### 2. adaptive-icon.png
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Description**: Android adaptive icon (make sure the important content is in the center 512x512 area)

### 3. splash.png
- **Size**: 1284x2778 pixels
- **Format**: PNG
- **Description**: Splash screen shown when app launches

### 4. favicon.png
- **Size**: 48x48 pixels
- **Format**: PNG
- **Description**: Web favicon (optional)

## How to Generate Icons:

You can use online tools to generate these assets:
- https://www.appicon.co/
- https://easyappicon.com/
- https://icon.kitchen/

Or use Expo's asset generation:
```bash
npx expo-optimize
```

## Default Behavior:

If these files are missing, Expo will use default placeholder images during development.
For production APK builds, you MUST provide these images.

## Tips:

- Use a simple, recognizable icon design
- Avoid text in icons (it becomes hard to read at small sizes)
- Use high contrast colors
- Test how the icon looks on different backgrounds
- The splash screen should match your app's color scheme
