const path = require('path');

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
  };

  if (env.platform === 'web') {
    base.entry = './src/client/clientEntry.tsx';
    base.output.filename = 'public/client.js';
  } else {
    base.target = 'node';
  }

  return base;
};
