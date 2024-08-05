#!/usr/bin/env node
import { start } from "./service";
import { FontManager } from "./utils/FontManager";
import { importConfig, getCommandLineParams } from "./utils";

// TODO: 支持 esModule

type Command = "start"; // 启动本地服务

interface CommandParams {
    port: number;
}

const { array, object } = getCommandLineParams<[Command], CommandParams>();

importConfig().then(config => {
    FontManager.validate(config);
    if (array[0] === "start") {
        start(object.port);
    } else {
        const fontManager = new FontManager(config);
        fontManager.read();
        fontManager.generate();
    }
});
