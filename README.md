## Overview
This repository provides a style dictionary-based theming solution for your applications, supporting both iOS and Android. The package generates unified theme files for each platform, which can be integrated as dependencies in your projects.

### How It Works
A default theme, `themes/default.json`, exists as a base theme to provide default values. Custom themes, such as `themes/custom.json`, can be created. If a custom theme does not specify a value for a particular token, the corresponding value from the default theme will be used.

### Output
Unified theme files are generated in the following locations:
- **iOS:** `build/ios/Theme.swift`
- **Android:** `build/android/Theme.kt`

These files include declarations for all provided themes.
