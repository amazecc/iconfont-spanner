import "webpack-dev-server"; // 导入类型，否则 webpack 配置没有 devServer 的类型
import merge from "webpack-merge";
import { Configuration, DefinePlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import common from "./webpack.common";
import { getCssLoaderConfig, version, postcssLoaderConfig, lessLoaderConfig } from "./config";

const config: Configuration = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    output: {
        filename: `${version}/js/[name].js`,
        chunkFilename: `${version}/js/[name].chunk.js`,
    },
    devServer: {
        open: true,
        historyApiFallback: true,
        proxy: [
            // {
            //     context: ["/v1"],
            //     target: "https://test-api.s-light.top",
            //     secure: true,
            //     changeOrigin: true,
            // },
        ],
    },
    module: {
        rules: [
            {
                test: /\.module\.(css|less)$/,
                exclude: /node_modules/,
                use: ["style-loader", getCssLoaderConfig("development", true), postcssLoaderConfig, lessLoaderConfig],
            },
            {
                test: /(?<!module)\.(css|less)$/,
                use: ["style-loader", getCssLoaderConfig("development"), postcssLoaderConfig, lessLoaderConfig],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "public/index.html",
            favicon: "public/favicon.ico",
            inject: true,
        }),
        new DefinePlugin({
            IS_DEV: JSON.stringify(true),
        }),
        new ReactRefreshWebpackPlugin(),
    ],
});

export default config;
