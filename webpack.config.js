const path = require('path');
const webpack = require('webpack');

// https://github.com/webpack-contrib/mini-css-extract-plugin

module.exports = function (env, argv) {
  const base = {
    entry: './src/server/index.ts',
    output: {
      filename: 'js/server.js',
      // path needs to be an ABSOLUTE file path
      path: path.resolve(__dirname, 'build'),
      publicPath: '/',
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: 'eval-cheap-module-source-map',
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
        {
          exclude: path.resolve(__dirname, "node_modules"),
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        }
      ]
    },
    target: 'node',
  };

  if (env.platform === 'web') {
    base.entry = {
      client: './src/client/client.tsx',
      login: './src/client/login.tsx'
    };
    base.output = {
      filename: '[name].js',
      path: __dirname + '/build/public',
    };
    base.plugins = [
      new webpack.NormalModuleReplacementPlugin(
        /.\/RT-PROP/,
        '../client.props'
      ),
    ];
    base.target = 'web'
  }
  return base;
};
