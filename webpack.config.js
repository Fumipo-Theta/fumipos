const path = require('path');
const webpack = require("webpack")

module.exports = {
    // モードの設定、v4系以降はmodeを指定しないと、webpack実行時に警告が出る
    mode: 'development',
    // エントリーポイントの設定
    entry: [
        /*"jquery",
        "jquery-ui",
        "jquery-ui-touch-punch",*/
        './src/js/app.js'
    ],
    // 出力の設定
    output: {
        // 出力するファイル名
        filename: 'app.js',
        // 出力先のパス（v2系以降は絶対パスを指定する必要がある）
        path: path.join(__dirname, 'docs/js')
    },
    devServer: {
        contentBase: path.join(__dirname, 'docs'),
        compress: true,
        port: 9000
    }
    /*
    plugins: [
      new webpack.ProvidePlugin({
        "$": "jquery",
        "jQuery": "jquery",
        "window.jQuery": "jquery",
        "window.$": "jquery"
      })],

    resolve: {
      alias: {
        'jquery-ui': 'jquery-ui',
        'jquery-ui-touch-punch': 'jquery-ui-touch-punch'
      }
    },*/
};
