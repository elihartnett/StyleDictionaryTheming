const fs = require("fs");
const path = require("path");

function waitForDir(dir, interval = 100, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkDir = () => {
      if (fs.existsSync(dir)) {
        return resolve();
      }
      if (Date.now() - startTime >= timeout) {
        console.error(
          `Timeout: Directory did not appear within ${timeout}ms: ${dir}`
        );
        process.exit(1);
      }
      setTimeout(checkDir, interval);
    };

    checkDir();
  });
}

function getCapitalizedThemeName(file) {
  const themeName = path.basename(file, ".json");
  return themeName.charAt(0).toUpperCase() + themeName.slice(1);
}

async function generateUnifiedIosTheme() {
  const iosBuildDir = path.join(__dirname, "build/ios");

  // Wait until the iOS build directory exists.
  await waitForDir(iosBuildDir);

  // Get generated theme files, excluding the unified file.
  const generatedIosThemeFiles = fs
    .readdirSync(iosBuildDir)
    .filter((file) => file.endsWith("Theme.swift") && file !== "Theme.swift");

  let unifiedIosContent = "import SwiftUI\n\nstruct Theme {\n\n";

  generatedIosThemeFiles.forEach((file) => {
    let content = fs.readFileSync(path.join(iosBuildDir, file), "utf8");

    // Remove the 'import SwiftUI' line (assumes it's at the top)
    content = content.replace(/^import SwiftUI\s*\n/, "");

    // Derive the nested struct name by removing the "Theme" suffix.
    const baseName = path.basename(file, ".swift");
    let nestedName = baseName;
    if (nestedName.endsWith("Theme")) {
      nestedName = nestedName.slice(0, -"Theme".length);
    }

    // Replace the original struct declaration with one for the nested struct.
    const regex = new RegExp(`struct\\s+${baseName}\\b`);
    content = content.replace(regex, `struct ${nestedName}`);

    // Indent the entire file content by 4 spaces.
    const indentedContent = content
      .split("\n")
      .map((line) => "    " + line)
      .join("\n");

    unifiedIosContent += indentedContent + "\n";
  });

  unifiedIosContent += "}\n";

  // Append the private UIColor extension at the bottom
  unifiedIosContent += "\nprivate extension UIColor {\n";
  unifiedIosContent += "    convenience init(hex: String) {\n";
  unifiedIosContent +=
    "        var hexString = hex.trimmingCharacters(in: .whitespacesAndNewlines)\n";
  unifiedIosContent +=
    '        if hexString.hasPrefix("#") { hexString.removeFirst() }\n';
  unifiedIosContent += "        var rgbValue: UInt64 = 0\n";
  unifiedIosContent +=
    "        Scanner(string: hexString).scanHexInt64(&rgbValue)\n";
  unifiedIosContent +=
    "        let red = CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0\n";
  unifiedIosContent +=
    "        let green = CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0\n";
  unifiedIosContent +=
    "        let blue = CGFloat(rgbValue & 0x0000FF) / 255.0\n";
  unifiedIosContent +=
    "        self.init(red: red, green: green, blue: blue, alpha: 1.0)\n";
  unifiedIosContent += "    }\n";
  unifiedIosContent += "}\n";

  const unifiedIosPath = path.join(iosBuildDir, "Theme.swift");
  fs.writeFileSync(unifiedIosPath, unifiedIosContent);
}

async function generateUnifiedAndroidTheme() {
  const androidBuildDir = path.join(__dirname, "build/android");

  // Wait until the Android build directory exists.
  await waitForDir(androidBuildDir);

  // Get generated theme files, excluding the unified file.
  const generatedAndroidThemeFiles = fs
    .readdirSync(androidBuildDir)
    .filter((file) => file.endsWith("Theme.kt") && file !== "Theme.kt");

  let unifiedAndroidContent = `package com.example.myapp.theme\n\nobject Theme {\n`;

  generatedAndroidThemeFiles.forEach((file) => {
    let content = fs.readFileSync(path.join(androidBuildDir, file), "utf8");

    // Remove any package declaration lines (assumes it’s at the top)
    content = content.replace(/^package\s+[^\n]+\n/, "");

    // Derive the nested object name by removing the "Theme" suffix.
    const baseName = path.basename(file, ".kt"); // e.g., "DefaultTheme"
    let nestedName = baseName;
    if (nestedName.endsWith("Theme")) {
      nestedName = nestedName.slice(0, -"Theme".length);
    }
    // Replace the original object declaration with one for the nested object.
    const regex = new RegExp(`object\\s+${baseName}\\b`);
    content = content.replace(regex, `object ${nestedName}`);

    // Indent the file content by 4 spaces so it nests inside Theme.
    const indentedContent = content
      .split("\n")
      .map((line) => "    " + line)
      .join("\n");

    unifiedAndroidContent += indentedContent + "\n";
  });

  unifiedAndroidContent += "}\n";

  const unifiedAndroidPath = path.join(androidBuildDir, "Theme.kt");
  fs.writeFileSync(unifiedAndroidPath, unifiedAndroidContent);
}

module.exports = {
  getCapitalizedThemeName,
  generateUnifiedIosTheme,
  generateUnifiedAndroidTheme,
};
