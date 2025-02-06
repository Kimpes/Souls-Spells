const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/app.ts", // Entry point for your application
  mode: "development", // Set to 'production' for optimized builds
  devtool: "inline-source-map", // Helps with debugging TypeScript
  module: {
    rules: [
      {
        test: /\.ts$/, // Handle TypeScript files
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // Handle image files
        use: "file-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"], // Resolve both .ts and .js files
  },
  output: {
    filename: "bundle.js", // Output bundle file
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"), // Serve files from the dist directory
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 9000, // Port for the dev server
  },
};
