module.exports = {
    env: {
        browser: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    extends: ["airbnb", "airbnb/hooks", "plugin:@typescript-eslint/eslint-recommended", "prettier"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    rules: {
        "arrow-body-style": 0,
        "global-require": 0,
        "no-use-before-define": 0,
        "max-classes-per-file": 0,
        "default-case": 0,
        "no-shadow": "off",
        "consistent-return": 0,
        "no-nested-ternary": 0,
        "react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
        "react/function-component-definition": 0,
        "react/react-in-jsx-scope": 0,
        "react/prop-types": 0,
        "react/destructuring-assignment": 0,
        "react/no-unknown-property": 0,
        "react/button-has-type": 0,
        "react/no-unescaped-entities": 0,
        "react/jsx-props-no-spreading": 0,
        "react/require-default-props": 0,
        "import/extensions": 0,
        "import/no-unresolved": 0,
        "import/prefer-default-export": 0,
        "import/order": 0,
        "import/no-extraneous-dependencies": 0,
        "jsx-a11y/click-events-have-key-events": 0,
        "jsx-a11y/interactive-supports-focus": 0,
        "jsx-a11y/no-static-element-interactions": 0,
        "jsx-a11y/anchor-is-valid": 0,
        "jsx-a11y/label-has-associated-control": 0,
        "jsx-a11y/control-has-associated-label": 0,
        "jsx-a11y/no-noninteractive-element-interactions": 0,
        "@typescript-eslint/no-shadow": 0,
        "@typescript-eslint/no-use-before-define": 0,
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                vars: "all",
                args: "after-used",
                ignoreRestSiblings: true,
            },
        ],
    },
};

// NOTE: 1. https://github.com/ArnaudBarre/eslint-plugin-react-refresh 可检查组件是否安全的快速刷新