const { isDynamicToken } = require("../helpers");

module.exports = function registerSwiftUIFormat(StyleDictionary) {
  StyleDictionary.registerFormat({
    name: "ios/swiftui",
    format: function ({ dictionary, options }) {
      const themeName = options.themeName;

      // Get all tokens
      const allTokens = dictionary.allProperties || dictionary.allTokens;

      // Filter tokens by type (using the first segment of the token path)
      const colorTokens = allTokens.filter(
        (token) => token.path[0] === "color"
      );
      const fontTokens = allTokens.filter((token) => token.path[0] === "font");
      const dimensionTokens = allTokens.filter(
        (token) => token.path[0] === "dimension"
      );

      // Build the Colors nested struct
      let colorsBlock = "\n    struct Colors {\n";
      colorTokens.forEach((token) => {
        const propertyName = token.path[1];
        if (isDynamicToken(token)) {
          colorsBlock += `        static var ${propertyName}: Color {\n`;
          colorsBlock += `            return Color(UIColor { traitCollection in\n`;
          colorsBlock += `                switch traitCollection.userInterfaceStyle {\n`;
          colorsBlock += `                case .dark:\n`;
          colorsBlock += `                    return UIColor(hex: "${token.value.dark}")\n`;
          colorsBlock += `                default:\n`;
          colorsBlock += `                    return UIColor(hex: "${token.value.light}")\n`;
          colorsBlock += `                }\n`;
          colorsBlock += `            })\n`;
          colorsBlock += `        }\n`;
        } else {
          colorsBlock += `        static var ${propertyName}: Color {\n`;
          colorsBlock += `            return Color(UIColor(hex: "${token.value}"))\n`;
          colorsBlock += `        }\n`;
        }
      });
      colorsBlock += "    }\n";

      // Build the Dimensions nested struct
      let dimensionsBlock = "    struct Dimensions {\n";
      dimensionTokens.forEach((token) => {
        const propertyName = token.path[1];
        dimensionsBlock += `        static let ${propertyName}: CGFloat = ${token.value}\n`;
      });
      dimensionsBlock += "    }\n";

      // Build the Fonts nested struct
      let fontsBlock = "    struct Fonts {\n";
      fontTokens.forEach((token) => {
        const propertyName = token.path[1];
        fontsBlock += `        static var ${propertyName}: Font { .custom("${token.value.fontName}", size: ${token.value.fontSize}) }\n`;
      });
      fontsBlock += "    }\n";

      // Assemble the main struct with nested Colors, Dimensions, and Fonts
      let output = "import SwiftUI\n\n";
      output += `struct ${themeName} {\n`;
      output += colorsBlock + "\n" + dimensionsBlock + "\n" + fontsBlock;
      output += "}\n";

      return output;
    },
  });
};
