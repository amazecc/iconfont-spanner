import React, { useEffect } from "react";
import { message, Modal } from "antd";
import { FilePicker } from "../basic/FilePicker";
import { addIcon } from "src/api/addIcon";
import { useSetState } from "ahooks";
import { EditableText } from "../basic/EditableText";
import { findDuplicates } from "src/utils";

export interface UploadModalProps {
    open?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

const readAsString = async (file: File) => {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
        reader.onload = e => {
            resolve(e.target?.result as string);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

interface State {
    files: { name: string; svg: string }[];
    repeatNames: string[];
    names: string[];
}

export const UploadModal: React.FC<UploadModalProps> = React.memo(({ open, onClose, onSuccess }) => {
    const [{ files, repeatNames, names }, setState] = useSetState<State>({ files: [], repeatNames: [], names: [] });

    useEffect(() => {
        setState({ repeatNames: findDuplicates([...files.map(item => item.name), ...names]) }); // 计算重复的名字
    }, [files, names, setState]);

    const changeSize = (svg: string) => svg.replace(/(?<=(?:\s(?:width)|(?:height))=["'])[\d\w]+/g, "40px");

    const onChange = async (fileList: File[]) => {
        const selectFiles = await Promise.all(
            fileList
                .filter(item => item.name.endsWith(".svg"))
                .map(async file => {
                    const svg = await readAsString(file);
                    return { name: file.name.replace(/\.svg$/, ""), svg: changeSize(svg) };
                }),
        );
        setState(prev => {
            return {
                files: [...prev.files, ...selectFiles],
            };
        });
    };

    const remove = (index: number) => {
        setState(prev => {
            const copyFiles = [...prev.files];
            copyFiles.splice(index, 1);
            return { files: copyFiles };
        });
    };

    const submit = async () => {
        if (repeatNames.length) {
            message.warning("请处理修改重复名称");
            return;
        }
        const result = await addIcon({ data: files });
        if (result?.repeatNames) {
            setState({ names: result.names });
        } else {
            onSuccess?.();
            onClose?.();
        }
    };

    const reset = () => {
        setState({ repeatNames: [], files: [] });
    };

    return (
        <Modal width={800} title="选择文件/文件夹" open={open} onCancel={onClose} onOk={submit} afterClose={reset}>
            <FilePicker dirDrop className="flex h-14 cursor-pointer items-center justify-center rounded border border-dashed bg-gray-100 transition-all hover:border-blue-600" onSelect={onChange}>
                <p className="ant-upload-text select-none text-gray-500">点击选择文件，支持多选与拖入文件夹</p>
            </FilePicker>

            {files.length > 0 && (
                <div className="mt-5 grid grid-cols-4 gap-3">
                    {files.map((file, index) => {
                        const isRepeat = repeatNames.includes(file.name);
                        return (
                            <div key={`${file.name}_${index}`} className={`flex flex-col items-center justify-start p-2 ${isRepeat ? "bg-red-300" : ""}`}>
                                <span dangerouslySetInnerHTML={{ __html: file.svg }} />
                                <EditableText
                                    onConfirm={async value => {
                                        if (value) {
                                            setState({
                                                files: files.map((_, i) => (i === index ? { ..._, name: value } : _)),
                                            });
                                        }
                                        return false;
                                    }}
                                >
                                    {start => (
                                        <p className="text-sm leading-6" onDoubleClick={() => start(file.name)}>
                                            {file.name}
                                        </p>
                                    )}
                                </EditableText>
                                <span className="text-xs text-red-700" onClick={() => remove(index)}>
                                    移除
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </Modal>
    );
});
