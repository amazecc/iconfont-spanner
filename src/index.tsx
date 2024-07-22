import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import type { SvgComponentMetadata } from "server/utils/FontManager/type";
import { SvgIconCard } from "./components/SvgIconCard";
import "./globals.css";

const App = () => {
    const [data, setData] = React.useState<SvgComponentMetadata[]>([]);

    const fetchList = () => {
        fetch("/api/list")
            .then(res => res.json())
            .then(res => setData(res.data.component));
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
        <div className="mx-auto max-w-screen-lg">
            <div className="flex items-center justify-between">
                <h1 className="my-5 text-4xl font-bold">预览</h1>
                <button onClick={generate}>生成字体</button>
            </div>
            <div className=" grid grid-cols-8 gap-3">
                {data.map(item => {
                    return <SvgIconCard key={item.fileName} data={item} onRemove={remove} onRename={rename} />;
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
