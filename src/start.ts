#!/usr/bin/env node
import { start } from "./service";
import { FontManager } from "./utils/FontManager";
import { importConfig } from "./utils";

importConfig().then(config => {
    FontManager.check(config);
    start();
});
