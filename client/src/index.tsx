import React, { useEffect, Suspense } from "react";
import ReactDOM from "react-dom/client";
import dayjs from "dayjs";
import { Button, ConfigProvider, message, Modal, notification, Tabs, Tooltip } from "antd";
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
import { getInfo } from "./api/getInfo";
import { UsageRadio, type UsageType } from "./components/UsageRadio";
import SvgIconGrid from "./components/SvgIconGrid";
import FontIconGrid from "./components/FontIconGrid";
import "./globals.css";

dayjs.locale("zh-cn");

window.addEventListener("unhandledrejection", event => {
    if (event.reason instanceof APIException) {
        event.preventDefault();
        if (event.reason.message.length > 20) {
            notification.warning({
                message: "提示",
                description: event.reason.message,
                placement: "top",
            });
        } else {
            message.error(event.reason.message);
        }
    }
});

const App = () => {
    const [title, setTitle] = React.useState<string>("");
    const [{ font, component }, setData] = React.useState<FontData>({});
    const [usageType, setUsageType] = React.useState<UsageType | undefined>();

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
        getInfo().then(res => {
            setTitle(res.title);
            document.title = res.title;
        });
    }, []);

    return (
        <ConfigProvider locale={zhCN}>
            <Suspense>
                <div className="fixed left-0 top-0 z-[1] w-full shadow backdrop-blur">
                    <div className="mx-auto flex max-w-screen-xl items-center justify-between py-4">
                        <h1 className="text-2xl font-semibold leading-none text-slate-700">{title}</h1>
                        <div className="flex gap-4">
                            <div className="mr-8 inline-flex gap-4">
                                <UsageRadio value={usageType} onChange={setUsageType} />
                                <Tooltip title="将扫描项目所有代码，比较耗时">
                                    <span>
                                        <AutoLoadingButton icon={<RadarChartOutlined />} danger type="primary" onClick={scan}>
                                            扫描
                                        </AutoLoadingButton>
                                    </span>
                                </Tooltip>
                            </div>
                            <Button icon={<VerticalLeftOutlined />} type="primary" onClick={openPrefixModal}>
                                设置前缀
                            </Button>
                            <Button icon={<PlusOutlined />} type="primary" onClick={setTrue}>
                                添加
                            </Button>
                            <Tooltip title="每次编辑图标，都需要重新转化资源">
                                <span>
                                    <AutoLoadingButton icon={<RetweetOutlined />} type="primary" onClick={generate}>
                                        转化
                                    </AutoLoadingButton>
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-screen-xl pb-11 pt-24">
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
                                children: <FontIconGrid usage={usage?.font} usageType={usageType} metadata={font.metadata} onRemove={remove} onRename={rename} />,
                            },
                            !!component && {
                                label: "SVG Component",
                                key: "svg",
                                children: <SvgIconGrid usage={usage?.component} usageType={usageType} metadata={component.metadata} onRemove={remove} onRename={rename} />,
                            },
                        ].filter(item => item !== false)}
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
