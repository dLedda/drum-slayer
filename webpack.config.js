const path = require("path");
const webpack = require("webpack");
const config = require("./config.json");

const TerserWebpackPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const webpackConfig = {
    mode: "development",
    entry: "./src/main.ts",
    plugins: [new webpack.ProgressPlugin()],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader",
                include: [path.resolve(__dirname, "src")],
                exclude: [/node_modules/]
            },
            {
                test: /.css$/,

                use: [{
                    loader: config.development ? "style-loader" : MiniCssExtractPlugin.loader,
                }, {
                    loader: "css-loader",
                    options: {
                        url: true,
                        sourceMap: true
                    }
                }]
            },
            // {
            //     test: /\.(png|jpe?g|gif|ttf|woff2?|eot|svg)$/i,
            //     use: [
            //         {
            //             loader: "file-loader",
            //         },
            //     ],
            // }
        ]
    },

    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },

    output: {
        filename: "bundle.js",
        publicPath: "static/",
        path: path.resolve(__dirname, "./public/static/"),
    },

    devServer: {
        static: {
            directory: path.join(__dirname, "./public"),
            publicPath: "/",
        },
        hot: true,
        compress: true,
        port: 9000,
    },
};

if (!config.development) {
    webpackConfig.optimization = {
        minimizer: [new TerserWebpackPlugin()],

        splitChunks: {
            cacheGroups: {
                vendors: {
                    priority: -10,
                    test: /[\\/]node_modules[\\/]/
                }
            },

            chunks: "async",
            minChunks: 1,
            minSize: 30000,
            name: false
        }
    };
    webpackConfig.mode = "production";
}

module.exports = {...webpackConfig};