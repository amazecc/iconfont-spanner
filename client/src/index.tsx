import React, { useEffect, Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import dayjs from "dayjs";
import { Button, ConfigProvider, message, Modal, Tabs, Tooltip } from "antd";
import { InfoCircleOutlined, PlusOutlined, RadarChartOutlined, RetweetOutlined, VerticalLeftOutlined } from "@ant-design/icons";
import { useBoolean } from "ahooks";
import zhCN from "antd/locale/zh_CN";
import { getIconList, type FontData } from "./api/getIconList";
import { renameIcon } from "./api/renameIcon";
import { removeIcon } from "./api/removeIcon";
import { generateIcon } from "./api/generateIcon";
import { scanIcon, type FontUsage } from "./api/scanIcon";
import { UploadModal } from "./components/UploadModal";
import { AutoLoadingButton } from "./components/basic/AutoLoadingButton";
import { UpdatePrefixModal } from "./components/UpdatePrefixModal";
import { APIException } from "./utils/exception";
import "./globals.css";

dayjs.locale("zh-cn");

const SvgIconGrid = lazy(() => import("./components/SvgIconGrid"));
const FontIconGrid = lazy(() => import("./components/FontIconGrid"));

window.addEventListener("unhandledrejection", event => {
    if (event.reason instanceof APIException) {
        event.preventDefault();
        if (event.reason.message.length > 20) {
            Modal.warning({
                title: "提示",
                content: event.reason.message,
            });
        } else {
            message.error(event.reason.message);
        }
    }
});

const App = () => {
    const [{ font, component }, setData] = React.useState<FontData>({});

    const [usage, setUsage] = React.useState<FontUsage | null>(null);

    const [open, { setFalse, setTrue }] = useBoolean();
    const [prefixModalOpen, { setFalse: closePrefixModal, setTrue: openPrefixModal }] = useBoolean();

    const fetchList = () => getIconList().then(res => setData(res));

    const rename = (oldName: string, newName: string) => {
        renameIcon(oldName, newName).then(fetchList);
    };

    const remove = (name: string) => {
        if (!usage) {
            message.warning("删除前请进行扫描图标，检查使用情况！");
            return;
        }
        const usedInFont = usage.font?.used.includes(name);
        const usedInSvg = usage.component?.used.includes(name);
        const unknownUsed = ![...(usage.font?.unused ?? []), ...(usage.font?.used ?? []), ...(usage.component?.used ?? []), ...(usage.component?.unused ?? [])].includes(name);
        Modal.confirm({
            title: "提示",
            content: ["确认删除图标吗？", usedInFont || usedInSvg ? "该图标已被使用！" : unknownUsed ? "该图标使用情况未知，建议重新扫描！" : ""].join(""),
            onOk() {
                removeIcon(name).then(fetchList);
            },
        });
    };

    const generate = async () => {
        await generateIcon();
        message.success("生成成功！");
    };

    const scan = async () => scanIcon().then(setUsage);

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <ConfigProvider locale={zhCN}>
            <Suspense>
                <div className="mx-auto max-w-screen-lg pb-11 pt-14">
                    <Tabs
                        type="card"
                        items={[
                            !!font && {
                                label: (
                                    <span>
                                        <span>Font Class</span>
                                        <Tooltip
                                            title={
                                                <div>
                                                    <strong>svg 文件要求：</strong>
                                                    <div>1. svg 标签内只含有 path 元素</div>
                                                    <div>2. path 元素只能使用 fill 属性填充颜色</div>
                                                </div>
                                            }
                                        >
                                            <span className="ml-3">
                                                <InfoCircleOutlined />
                                            </span>
                                        </Tooltip>
                                    </span>
                                ),
                                key: "font",
                                children: <FontIconGrid usage={usage?.font} metadata={font.metadata} onRemove={remove} onRename={rename} />,
                            },
                            !!component && {
                                label: "SVG Component",
                                key: "svg",
                                children: <SvgIconGrid usage={usage?.component} metadata={component.metadata} onRemove={remove} onRename={rename} />,
                            },
                        ].filter(item => item !== false)}
                        tabBarExtraContent={{
                            right: (
                                <div className="flex gap-4">
                                    <div className="inline-flex gap-3">
                                        <span className="flex items-center text-xs text-gray-700">
                                            <span className="mr-1 h-[1em] w-[1em] border border-gray-300 bg-slate-200" />
                                            未使用
                                        </span>
                                        <span className="flex items-center text-xs text-gray-700">
                                            <span className="mr-1 h-[1em] w-[1em] border border-gray-300 bg-green-200" />
                                            已使用
                                        </span>
                                        <span className="flex items-center text-xs text-gray-700">
                                            <span className="mr-1 h-[1em] w-[1em] border border-gray-300" />
                                            未知
                                        </span>
                                        <AutoLoadingButton icon={<RadarChartOutlined />} type="primary" onClick={scan}>
                                            扫描
                                        </AutoLoadingButton>
                                    </div>
                                    <Button icon={<VerticalLeftOutlined />} type="primary" onClick={openPrefixModal}>
                                        设置前缀
                                    </Button>
                                    <Button icon={<PlusOutlined />} type="primary" onClick={setTrue}>
                                        添加
                                    </Button>
                                    <Tooltip title="每次编辑图标，都需要重新转化资源">
                                        <AutoLoadingButton icon={<RetweetOutlined />} type="primary" onClick={generate}>
                                            转化
                                        </AutoLoadingButton>
                                    </Tooltip>
                                </div>
                            ),
                        }}
                    />
                    <UploadModal open={open} onClose={setFalse} onSuccess={fetchList} />
                    <UpdatePrefixModal
                        open={prefixModalOpen}
                        onClose={closePrefixModal}
                        onSuccess={() => {
                            closePrefixModal();
                            fetchList();
                        }}
                    />
                </div>
            </Suspense>
        </ConfigProvider>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
