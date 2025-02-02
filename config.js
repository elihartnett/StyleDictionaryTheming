const fs = require("fs");
const path = require("path");
const merge = require("lodash.merge");
const StyleDictionary = require("style-dictionary").default;
const {
  getCapitalizedThemeName,
  generateUnifiedIosTheme,
  generateUnifiedAndroidTheme,
} = require("./helpers");

// 1. Set up directories
const themesDir = path.join(__dirname, "themes");
const mergedDir = path.join(themesDir, "merged");
if (!fs.existsSync(mergedDir)) {
  fs.mkdirSync(mergedDir, { recursive: true });
}

// 2. Load the default theme
const defaultThemePath = path.join(themesDir, "default.json");
if (!fs.existsSync(defaultThemePath)) {
  throw new Error(
    `Default theme file is required but was not found at: ${defaultThemePath}`
  );
}
const defaultTheme = JSON.parse(fs.readFileSync(defaultThemePath, "utf8"));

// 3. Read all theme files from the themes folder
const themeFiles = fs
  .readdirSync(themesDir)
  .filter((file) => file.endsWith(".json") && file !== "merged");

// 4. Merge each theme with the default theme and write to the merged directory
themeFiles.forEach((file) => {
  const themePath = path.join(themesDir, file);
  const themeData = JSON.parse(fs.readFileSync(themePath, "utf8"));

  // Use the default theme as fallback unless this is the default theme itself.
  const mergedTheme =
    file === "default.json" ? themeData : merge({}, defaultTheme, themeData);

  const mergedPath = path.join(mergedDir, file);
  fs.writeFileSync(mergedPath, JSON.stringify(mergedTheme, null, 2));
});

// 5. Register your custom formats for both platforms
const registerSwiftUIFormat = require("./format/ios/swiftui");
registerSwiftUIFormat(StyleDictionary);

const registerJetpackThemeFormat = require("./format/android/jetpack");
registerJetpackThemeFormat(StyleDictionary);

// 6. For each merged theme file, create a separate Style Dictionary configuration
const mergedThemeFiles = fs
  .readdirSync(mergedDir)
  .filter((file) => file.endsWith(".json"));

mergedThemeFiles.forEach((file) => {
  const capitalizedThemeName = getCapitalizedThemeName(file);

  const config = {
    source: [path.join(mergedDir, file)], // Only this theme's tokens are loaded.
    platforms: {
      ios: {
        buildPath: "build/ios/",
        files: [
          {
            destination: `${capitalizedThemeName}Theme.swift`,
            format: "ios/swiftui",
            options: { themeName: `${capitalizedThemeName}Theme` },
          },
        ],
      },
      android: {
        buildPath: "build/android/",
        files: [
          {
            destination: `${capitalizedThemeName}Theme.kt`,
            format: "android/jetpack",
            options: { themeName: `${capitalizedThemeName}Theme` },
          },
        ],
      },
    },
  };

  const sd = new StyleDictionary(config);
  sd.buildAllPlatforms();
});

// Generate unified theme file for both platforms
generateUnifiedIosTheme();
generateUnifiedAndroidTheme();
