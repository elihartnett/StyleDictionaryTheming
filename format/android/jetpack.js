const { isDynamicToken } = require("../helpers");

module.exports = function registerJetpackFormat(StyleDictionary) {
  StyleDictionary.registerFormat({
    name: "android/jetpack",
    format: function ({ dictionary, options }) {
      // Use the provided theme name from options or default to "DefaultTheme"
      const themeName = (options && options.themeName) || "DefaultTheme";

      // Get all tokens
      const allTokens = dictionary.allProperties || dictionary.allTokens;

      // Filter tokens by type (using the first segment in the token path)
      const colorTokens = allTokens.filter(
        (token) => token.path[0] === "color"
      );
      const fontTokens = allTokens.filter((token) => token.path[0] === "font");
      const dimensionTokens = allTokens.filter(
        (token) => token.path[0] === "dimension"
      );

      // Helper function to convert a hex string into a Kotlin color literal.
      // For example, "#000000" -> "0xFF000000".
      const toKotlinColorLiteral = (hex) => {
        let hexClean = hex.trim().replace(/^#/, "");
        // If the hex string is 6 characters long, add full opacity ("FF") as the alpha.
        if (hexClean.length === 6) {
          return "0xFF" + hexClean.toUpperCase();
        } else {
          return "0x" + hexClean.toUpperCase();
        }
      };

      let output = "";

      // Package and imports
      output += "package com.example.myapp.theme\n\n";
      output += "import androidx.compose.ui.graphics.Color\n";
      output += "import androidx.compose.runtime.Composable\n";
      output += "import androidx.compose.foundation.isSystemInDarkTheme\n";
      output += "import androidx.compose.ui.text.font.Font\n";
      output += "import androidx.compose.ui.text.font.FontFamily\n\n";

      // Start main theme object
      output += `object ${themeName} {\n\n`;

      // Colors nested object
      output += "    object Colors {\n";
      colorTokens.forEach((token) => {
        const propertyName = token.path[1];
        if (isDynamicToken(token)) {
          output += `        val ${propertyName}: Color\n`;
          output += "            @Composable\n";
          output += "            get() = if (isSystemInDarkTheme()) {\n";
          output += `                Color(${toKotlinColorLiteral(token.value.dark)})\n`;
          output += "            } else {\n";
          output += `                Color(${toKotlinColorLiteral(token.value.light)})\n`;
          output += "            }\n";
        } else {
          output += `        val ${propertyName}: Color = Color(${toKotlinColorLiteral(token.value)})\n`;
        }
      });
      output += "    }\n\n";

      // Dimensions nested object
      output += "    object Dimensions {\n";
      dimensionTokens.forEach((token) => {
        const propertyName = token.path[1];
        // Append an "f" suffix to denote a Float literal in Kotlin.
        output += `        const val ${propertyName}: Float = ${token.value}f\n`;
      });
      output += "    }\n\n";

      // Fonts nested object
      output += "    object Fonts {\n";
      fontTokens.forEach((token) => {
        const propertyName = token.path[1];
        // Convert the font name to a resource-friendly identifier (e.g., "Helvetica-Bold" -> "helvetica_bold")
        const fontResource = token.value.fontName
          .toLowerCase()
          .replace(/-/g, "_");
        output += `        val ${propertyName} = FontFamily(Font(R.font.${fontResource}))\n`;
      });
      output += "    }\n";

      // End main theme object
      output += "}\n";

      return output;
    },
  });
};
