module.exports = {
  devtool: 'source-map',
  watch: false,
  progress: true,
  progress: false,
  keepalive: false,
  failOnError: false,
  stats: {
    colors:  true,
    modules: true,
    reasons: true
  },

  entry: __dirname + "/demo/index.js",
  output: {
    path: __dirname + '/html',
    filename: 'index.js'
  },

  resolve: {
    root: __dirname + '/demo',
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js']
  }
};


