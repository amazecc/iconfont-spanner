import path from "path";
import { Configuration, ProgressPlugin } from "webpack";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { version } from "./config";

const config: Configuration = {
    entry: path.resolve(__dirname, "../../src/index.tsx"),
    output: {
        path: path.resolve(__dirname, "../../../out/static"),
        publicPath: "/",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", "jsx"],
        plugins: [new TsconfigPathsPlugin()],
    },
    module: {
        rules: [
            { test: /\.(t|j)sx?$/, loader: "babel-loader", exclude: /node_modules/ },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                type: "asset",
                generator: {
                    filename: `${version}/img/[name]-[contenthash][ext]`,
                },
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024, // 8kb
                    },
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)\??.*$/,
                type: "asset/resource",
                generator: {
                    filename: `${version}/font/[name]-[contenthash][ext]`,
                },
            },
        ],
    },
    plugins: [
		new NodePolyfillPlugin(),
        new ForkTsCheckerWebpackPlugin(),
        new ProgressPlugin(),
    ],
};

export default config;
