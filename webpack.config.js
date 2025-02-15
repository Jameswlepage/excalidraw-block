const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const webpack = require('webpack');

module.exports = {
    ...defaultConfig,
    plugins: [
        ...defaultConfig.plugins,
        new webpack.DefinePlugin({
            'process.env.IS_PREACT': JSON.stringify('false')
        })
    ]
}; 