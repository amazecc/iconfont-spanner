import React, { useEffect, Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import type { SvgComponentMetadata, FontMetadata } from "@/utils/FontManager/type";
import "./globals.css";

const SvgIconGrid = lazy(() => import("./components/SvgIconGrid"));
const FontIconGrid = lazy(() => import("./components/FontIconGrid"));

interface FontData {
    font?: {
        name: string;
        metadata: FontMetadata[];
    };
    component?: {
        metadata: SvgComponentMetadata[];
    };
}

const App = () => {
    const [{ font, component }, setData] = React.useState<FontData>({});

    const fetchList = () => {
        fetch("/api/list")
            .then(res => res.json())
            .then(res => setData(res.data));
    };

    const rename = (oldName: string, newName: string) => {
        fetch("/api/rename", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // 设置请求头，指明请求体格式为 JSON
            },
            body: JSON.stringify({ oldName, newName }),
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    fetchList();
                } else {
                    alert(res.message);
                }
            });
    };

    const remove = (name: string) => {
        fetch("/api/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // 设置请求头，指明请求体格式为 JSON
            },
            body: JSON.stringify({ name }),
        }).then(() => {
            fetchList();
        });
    };

    const generate = () => {
        fetch("/api/generate", { method: "POST" }).then(() => {
            alert("生成成功");
        });
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <Suspense>
            <div className="mx-auto max-w-screen-lg">
                <div className="flex items-center justify-between">
                    <h1 className="my-5 text-4xl font-bold">预览</h1>
                    <button className="text-xl font-bold" onClick={generate}>
                        生成字体
                    </button>
                </div>

                {component && (
                    <>
                        <h2 className="my-5 text-2xl font-bold">SVG 组件</h2>
                        <SvgIconGrid metadata={component.metadata} onRemove={remove} onRename={rename} />
                    </>
                )}

                {font && (
                    <>
                        <h2 className="my-5 text-2xl font-bold">字体图标</h2>
                        <FontIconGrid metadata={font.metadata} onRemove={remove} onRename={rename} />
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
