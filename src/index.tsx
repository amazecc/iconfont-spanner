import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import type { SvgFileMetadata } from "server/utils/FontManager/type";
import "./globals.css";

const App = () => {
    const [data, setData] = React.useState<SvgFileMetadata[]>([]);
    useEffect(() => {
        fetch("/api/list")
            .then(res => res.json())
            .then(setData);
    }, []);

    return (
        <div className="mx-auto max-w-screen-lg">
            <h1 className="my-5 text-4xl font-bold">预览</h1>
            <div>
                <button
                    onClick={() => {
                        fetch("/api/generate", { method: "POST" }).then(() => {
                            alert("生成成功");
                        });
                    }}
                >
                    生成字体
                </button>
            </div>
            <div className=" grid grid-cols-8 gap-3">
                {data.map(item => {
                    return (
                        <div key={item.fileName} className="flex flex-col items-center justify-center">
                            <span className="text-[52px]" dangerouslySetInnerHTML={{ __html: item.svgOptimizeString }} />
                            <span>{item.fileName}</span>
                            <span>&amp;#x${item.unicodeHex.toString(16)};</span>
                            <span>{item.svgReactComponentName}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
