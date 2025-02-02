# Style Dictionary Theming

## Overview

This repository provides a Style Dictionary–based theming solution for your applications, supporting both iOS and Android. The package generates unified theme files for each platform, which can be integrated as dependencies in your projects.

## How It Works

A default theme, `themes/default.json`, acts as the base theme by providing fallback values. Custom themes (e.g. `themes/custom.json`) can be created, and any token not explicitly defined in a custom theme will fall back to the corresponding value in the default theme.

## Output

Unified theme files are generated in the following locations:
- **iOS:** `build/ios/Theme.swift`
- **Android:** `build/android/Theme.kt`

## Example

### Inputs

`themes/default.json`
```json
{
  "color": {
    "primary": {
      "value": "#000000"
    },
    "dynamicPrimary": {
      "value": {
        "light": "#000000",
        "dark": "#FFFFFF"
      }
    }
  },
  "dimension": {
    "padding": {
      "value": 0
    }
  },
  "font": {
    "body": {
      "value": {
        "fontName": "Helvetica",
        "fontSize": 0
      }
    }
  }
}
```
`themes/custom.json`
```json
{
    "color": {
      "custom": {
        "value": "#FF0000"
      }
    }
}
```

**Outputs:**

`build/ios/Theme.swift`
```swift
struct Theme {

    struct Custom {
        struct Colors {
            static var primary: Color {
                return Color(UIColor(hex: "#000000"))
            }
            static var dynamicPrimary: Color {
                return Color(UIColor { traitCollection in
                    switch traitCollection.userInterfaceStyle {
                    case .dark:
                        return UIColor(hex: "#FFFFFF")
                    default:
                        return UIColor(hex: "#000000")
                    }
                })
            }
            static var custom: Color {
                return Color(UIColor(hex: "#FF0000"))
            }
        }
    
        struct Dimensions {
            static let padding: CGFloat = 0
        }
    
        struct Fonts {
            static var body: Font { .custom("Helvetica", size: 0) }
        }
    }
    
    struct Default {
        struct Colors {
            static var primary: Color {
                return Color(UIColor(hex: "#000000"))
            }
            static var dynamicPrimary: Color {
                return Color(UIColor { traitCollection in
                    switch traitCollection.userInterfaceStyle {
                    case .dark:
                        return UIColor(hex: "#FFFFFF")
                    default:
                        return UIColor(hex: "#000000")
                    }
                })
            }
        }
    
        struct Dimensions {
            static let padding: CGFloat = 0
        }
    
        struct Fonts {
            static var body: Font { .custom("Helvetica", size: 0) }
        }
    }
```
`build/ios/Theme.swift`
```kotlin
object Theme {
    import androidx.compose.ui.graphics.Color
    import androidx.compose.runtime.Composable
    import androidx.compose.foundation.isSystemInDarkTheme
    import androidx.compose.ui.text.font.Font
    import androidx.compose.ui.text.font.FontFamily
    
    object Custom {
    
        object Colors {
            val primary: Color = Color(0xFF000000)
            val dynamicPrimary: Color
                @Composable
                get() = if (isSystemInDarkTheme()) {
                    Color(0xFFFFFFFF)
                } else {
                    Color(0xFF000000)
                }
            val custom: Color = Color(0xFFFF0000)
        }
    
        object Dimensions {
            const val padding: Float = 0f
        }
    
        object Fonts {
            val body = FontFamily(Font(R.font.helvetica))
        }
    }
    
    import androidx.compose.ui.graphics.Color
    import androidx.compose.runtime.Composable
    import androidx.compose.foundation.isSystemInDarkTheme
    import androidx.compose.ui.text.font.Font
    import androidx.compose.ui.text.font.FontFamily
    
    object Default {
    
        object Colors {
            val primary: Color = Color(0xFF000000)
            val dynamicPrimary: Color
                @Composable
                get() = if (isSystemInDarkTheme()) {
                    Color(0xFFFFFFFF)
                } else {
                    Color(0xFF000000)
                }
        }
    
        object Dimensions {
            const val padding: Float = 0f
        }
    
        object Fonts {
            val body = FontFamily(Font(R.font.helvetica))
        }
    }
}
```
