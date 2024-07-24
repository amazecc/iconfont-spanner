module.exports = api => {
    return {
        presets: [
            ["@babel/preset-env", { loose: true }],
            ["@babel/preset-typescript", { isTSX: true, allowDeclareFields: true, allExtensions: true }],
            ["@babel/preset-react", { runtime: "automatic" }],
        ],
        plugins: [api.env("development") && "react-refresh/babel", ["@babel/plugin-transform-runtime", { corejs: 3 }]].filter(Boolean),
    };
};
