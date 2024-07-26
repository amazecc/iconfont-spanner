import React, { useEffect, Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./globals.css";
import { getIconList, type FontData } from "./api/getIconList";
import { renameIcon } from "./api/renameIcon";
import { removeIcon } from "./api/removeIcon";
import { generateIcon } from "./api/generateIcon";
import { scanIcon, type FontUsage } from "./api/scanIcon";
import { IconArea } from "./font/react-components/IconArea";

const SvgIconGrid = lazy(() => import("./components/SvgIconGrid"));
const FontIconGrid = lazy(() => import("./components/FontIconGrid"));

const App = () => {
    const [{ font, component }, setData] = React.useState<FontData>({});

    const [usage, setUsage] = React.useState<FontUsage | null>(null);

    const fetchList = () => getIconList().then(res => setData(res));

    const rename = (oldName: string, newName: string) => {
        renameIcon(oldName, newName)
            .then(() => {
                fetchList();
            })
            .catch(err => {
                alert(err.message);
            });
    };

    const remove = (name: string) => {
        if (!usage) {
            alert("删除前请进行扫描图标，检查使用情况！");
            return;
        }
        const usedInFont = usage.font?.used.some(used => used === name);
        const usedInSvg = usage.component?.used.some(used => used === name);
        if (window.confirm(["确认删除图标吗？", usedInFont || usedInSvg ? "该图标已被使用！" : ""].join(""))) {
            removeIcon(name).then(fetchList);
        }
    };

    const generate = () => {
        generateIcon().then(() => {
            alert("生成成功");
        });
    };

    const scan = () => {
        scanIcon()
            .then(res => {
                setUsage(res);
            })
            .catch(error => {
                alert(error.message);
            });
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <Suspense>
            <div className="mx-auto max-w-screen-lg">
                <div className="flex items-center justify-between">
                    <h1 className="my-5 text-4xl font-bold">
                        预览
                        <IconArea />
                        <span className="iconfont icon-color_oc" />
                    </h1>
                    <button className="text-xl font-bold" onClick={scan}>
                        扫描
                    </button>
                    <button className="text-xl font-bold" onClick={generate}>
                        生成字体
                    </button>
                </div>

                {component && (
                    <>
                        <h2 className="my-5 text-2xl font-bold">SVG 组件</h2>
                        <SvgIconGrid usage={usage?.component} metadata={component.metadata} onRemove={remove} onRename={rename} />
                    </>
                )}

                {font && (
                    <>
                        <h2 className="my-5 text-2xl font-bold">字体图标</h2>
                        <FontIconGrid usage={usage?.font} metadata={font.metadata} onRemove={remove} onRename={rename} />
                    </>
                )}
            </div>
        </Suspense>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
