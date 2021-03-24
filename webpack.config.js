const path = require('path');

module.exports = function (env, argv) {
  // default to the server configuration
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
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
  };

  // server-specific configuration
  if (env.platform === 'web') {
    // client-specific configurations
    base.entry = './src/client/clientEntry.tsx';
    base.output.filename = 'public/client.js';
  } else {
    base.target = 'node';
  }

  return base;
};
