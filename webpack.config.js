const path = require('path');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = {
    entry: 'index',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'lon.js',
        library: 'LON',
        libraryTarget: 'umd'
    },
    node: {
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
        fs: 'empty',
        path: 'empty'
    },
    resolve: {
        root: path.join(__dirname, 'src'),
        modulesDirectories: ['node_modules']
    },
    plugins: [
        new UglifyJsPlugin()
    ]
};
