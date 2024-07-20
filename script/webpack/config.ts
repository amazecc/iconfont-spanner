import type { RuleSetRule } from "webpack";

export const version = Date.now().toString();

export const getCssLoaderConfig = (env: "development" | "production", enableCssModule = false): RuleSetRule => ({
    loader: "css-loader",
    options: {
        importLoaders: 2,
        modules: enableCssModule && {
            localIdentName: env === "development" ? "[path][name]__[local]" : "[hash:base64]",
        },
    },
});

export const postcssLoaderConfig: RuleSetRule = {
    loader: "postcss-loader",
    options: {
        postcssOptions: {
            plugins: {
                tailwindcss: {},
                "postcss-flexbugs-fixes": {},
                "postcss-preset-env": {
                    autoprefixer: {
                        flexbox: "no-2009",
                    },
                    stage: 3,
                    features: {
                        "nesting-rules": true, // 支持css嵌套写法
                    },
                },
            },
        },
    },
};

export const lessLoaderConfig: RuleSetRule = {
    loader: "less-loader",
    options: {
        lessOptions: {
            math: "always", // 始终开启计算
            javascriptEnabled: true,
            // modifyVars: {},
        },
    },
};
