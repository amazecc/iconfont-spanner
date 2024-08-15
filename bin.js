const isCommonJS = typeof require !== "undefined" && typeof module !== "undefined";

if (isCommonJS) {
    require("./out/cjs/start").run();
} else {
    import("./out/esm/start.js").then(({ run }) => run());
}
