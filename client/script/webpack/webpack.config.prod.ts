import path from "path";
import merge from "webpack-merge";
import { Configuration, DefinePlugin } from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CompressionPlugin from "compression-webpack-plugin";
// import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { getCssLoaderConfig, version, lessLoaderConfig, postcssLoaderConfig } from "./config";
import common from "./webpack.common";

const config: Configuration = merge(common, {
    mode: "production",
    output: {
        filename: `${version}/js/[name].[contenthash:8].js`,
        chunkFilename: `${version}/js/[name].[contenthash:8].js`,
    },
    bail: true,
    optimization: {
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: true,
        minimizer: [
            /**
             * webpack 5 中可以使用 '...' 来访问默认值
             * @see https://webpack.docschina.org/configuration/optimization/#optimizationminimizer
             */
            "...",
            new CssMinimizerPlugin(),
        ],
    },
    module: {
        rules: [
            {
                test: /\.module\.(css|less)$/,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, getCssLoaderConfig("production", true), postcssLoaderConfig, lessLoaderConfig],
            },
            {
                test: /(?<!module)\.(css|less)$/,
                use: [MiniCssExtractPlugin.loader, getCssLoaderConfig("production"), postcssLoaderConfig, lessLoaderConfig],
            },
        ],
    },
    plugins: [
        new DefinePlugin({
            IS_DEV: JSON.stringify(false),
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "../../../out/static")],
        }),
        new MiniCssExtractPlugin({
            filename: `${version}/css/[name].[contenthash:8].css`,
            chunkFilename: `${version}/css/[name].[contenthash:8].chunk.css`,
        }),
        new HtmlWebpackPlugin({
            template: "public/index.html",
            favicon: "public/favicon.ico",
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: false,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new CompressionPlugin({
            test: /\.(js|css)/,
        }),
        // new BundleAnalyzerPlugin({
        //     generateStatsFile: true,
        // }),
    ],
});

export default config;
