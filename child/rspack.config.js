const rspack = require("@rspack/core");
const refreshPlugin = require("@rspack/plugin-react-refresh");
const isDev = process.env.NODE_ENV === "development";
const path = require("path");

const deps = require(path.resolve(__dirname, "./package.json")).dependencies;

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  context: __dirname,
  mode: isDev ? "development" : "production",
  devtool: !isDev ? "source-map" : "eval-cheap-module-source-map",
  entry: {
    main: "./src/main.jsx",
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: "asset",
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              compact: false,
              module: {
                type: "es6",
              },
              minify: !isDev,
              isModule: true,
              jsc: {
                loose: true,
                target: "es5",
                parser: {
                  syntax: "typescript",
                  tsx: true,
                  jsx: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },
  devServer: {
    port: 8082,
    headers: {
      "Access-Control-Allow-Origin": "*",
      Server: "Rspack",
    },
  },
  plugins: [
    new rspack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    new rspack.container.ModuleFederationPlugin({
      name: "child",
      uniqueName: "child",
      filename: "remote.js",
      exposes: {
        "./app": "./src/App.jsx",
      },
      remotes: {
        host: "host@http://localhost:8081/remote.js",
        child: "child@http://localhost:8082/remote.js",
      },
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps["react"] },
        "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
      },
    }),
    new rspack.ProgressPlugin({}),
    new rspack.HtmlRspackPlugin({
      template: "./index.html",
    }),
    isDev && new refreshPlugin(),
  ].filter(Boolean),
};



