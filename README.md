# Style Dictionary Theme

## Overview

This repository provides a Style Dictionary based theming solution for your applications, supporting both iOS and Android. A theme can hold color, dimension, and font tokens.

## How It Works

A default theme, `themes/default.json`, acts as the base theme by providing fallback values. Custom themes (e.g. `themes/custom.json`) can be created, and any token not explicitly defined in a custom theme will fall back to the corresponding value in the default theme.

### Inputs

Themes

`themes/default.json`
`themes/custom.json`

## Outputs

Unified theme files

- **iOS:** `build/ios/Theme.swift`
- **Android:** `build/android/Theme.kt`
