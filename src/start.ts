#!/usr/bin/env node
import { start } from "./service";
import { FontManager } from "./utils/FontManager";
import { importConfig } from "./utils";

// TODO: 支持命令行

importConfig().then(config => {
    FontManager.check(config);
    start();
});
