import React, { useEffect, Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import dayjs from "dayjs";
import { Button, ConfigProvider, message, Modal, Popover, Tabs, Typography } from "antd";
import { PlusOutlined, RadarChartOutlined, RetweetOutlined, SyncOutlined } from "@ant-design/icons";
import { useBoolean } from "ahooks";
import zhCN from "antd/locale/zh_CN";
import { getIconList, type FontData } from "./api/getIconList";
import { renameIcon } from "./api/renameIcon";
import { removeIcon } from "./api/removeIcon";
import { generateIcon } from "./api/generateIcon";
import { scanIcon, type FontUsage } from "./api/scanIcon";
import { UploadModal } from "./components/UploadModal";
import { AutoLoadingButton } from "./components/basic/AutoLoadingButton";
import "./globals.css";

dayjs.locale("zh-cn");

const SvgIconGrid = lazy(() => import("./components/SvgIconGrid"));
const FontIconGrid = lazy(() => import("./components/FontIconGrid"));

const App = () => {
    const [{ font, component }, setData] = React.useState<FontData>({});

    const [usage, setUsage] = React.useState<FontUsage | null>(null);

    const [open, { setFalse, setTrue }] = useBoolean();

    const fetchList = () => getIconList().then(res => setData(res));

    const rename = (oldName: string, newName: string) => {
        renameIcon(oldName, newName)
            .then(fetchList)
            .catch(err => {
                message.error(err.message);
            });
    };

    const remove = (name: string) => {
        if (!usage) {
            message.warning("删除前请进行扫描图标，检查使用情况！");
            return;
        }
        const usedInFont = usage.font?.used.some(used => used === name);
        const usedInSvg = usage.component?.used.some(used => used === name);
        Modal.confirm({
            title: "提示",
            content: ["确认删除图标吗？", usedInFont || usedInSvg ? "该图标已被使用！" : ""].join(""),
            onOk() {
                removeIcon(name).then(fetchList);
            },
        });
    };

    const generate = async () => {
        await generateIcon();
        message.success("生成成功！");
    };

    const scan = async () => {
        return scanIcon()
            .then(res => {
                setUsage(res);
            })
            .catch(error => {
                message.error(error.message);
            });
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <ConfigProvider locale={zhCN}>
            <Suspense>
                <div className="mx-auto max-w-screen-lg pb-11">
                    <div className="flex flex-col justify-center py-3">
                        <Typography.Title level={5}>说明：</Typography.Title>
                        <Typography.Text type="secondary">1. 添加图标两种方式：1）将 svg 文件放入配置文件的 resourceDir 目录中；2）点击【上传】按钮</Typography.Text>
                        <Typography.Text type="secondary">3. 每次编辑图标后，如添加，删除，修改名称后，都需要点击【转化】按钮重新生成可直接使用的资源</Typography.Text>
                        <Typography.Text type="secondary">2. 删除前，请点击【扫描】，检查图标使用情况，灰色为未使用图标（若项目文件过多，扫描过程可能比较久，耐心等待）</Typography.Text>
                    </div>
                    <Tabs
                        type="card"
                        items={[
                            !!font && {
                                label: "Font Class",
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
                                    <AutoLoadingButton icon={<SyncOutlined />} type="primary" onClick={fetchList}>
                                        刷新
                                    </AutoLoadingButton>
                                    <Popover
                                        content={
                                            <span className="flex items-center text-xs text-gray-700">
                                                <span className="mr-1 h-[1em] w-[1em] bg-slate-200" />
                                                未使用
                                            </span>
                                        }
                                    >
                                        <AutoLoadingButton icon={<RadarChartOutlined />} type="primary" onClick={scan}>
                                            扫描
                                        </AutoLoadingButton>
                                    </Popover>

                                    <Button icon={<PlusOutlined />} type="primary" onClick={setTrue}>
                                        添加
                                    </Button>
                                    <AutoLoadingButton icon={<RetweetOutlined />} type="primary" onClick={generate}>
                                        转化
                                    </AutoLoadingButton>
                                </div>
                            ),
                        }}
                    />
                    <UploadModal open={open} onClose={setFalse} onSuccess={fetchList} />
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
