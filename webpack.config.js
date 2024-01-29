const path = require("path");
const webpack = require("webpack")

module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,

        use: ["style-loader", "css-loader"],
      },
    ],
  },
 resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
