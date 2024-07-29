import React, { useEffect } from "react";
import { message, Modal } from "antd";
import { FilePicker } from "../basic/FilePicker";
import { addIcon } from "src/api/addIcon";
import { useSetState } from "ahooks";
import { findDuplicates, isValidFontName } from "src/utils";
import { FontCard } from "../FontCard";

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
    invalidNames: string[];
    names: string[];
}

export const UploadModal: React.FC<UploadModalProps> = React.memo(({ open, onClose, onSuccess }) => {
    const [{ files, repeatNames, invalidNames, names }, setState] = useSetState<State>({ files: [], repeatNames: [], names: [], invalidNames: [] });

    useEffect(() => {
        setState({
            repeatNames: findDuplicates([...files.map(item => item.name), ...names]), // 计算重复的名字
            invalidNames: files.filter(item => !isValidFontName(item.name)).map(item => item.name), // 计算不合规名字
        });
    }, [files, names, setState]);

    const changeSize = (svg: string) => svg.replace(/(?<=(?:\s(?:width)|(?:height))=["'])[\d\w.]+/g, "44px");

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
        if (repeatNames.length || invalidNames.length) {
            message.warning("请修改重复或不合规名称的图标");
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
        <Modal width={700} title="选择文件/文件夹" open={open} onCancel={onClose} onOk={submit} afterClose={reset}>
            <FilePicker dirDrop className="flex h-16 cursor-pointer items-center justify-center rounded border border-dashed bg-gray-100 transition-all hover:border-blue-600" onSelect={onChange}>
                <p className="ant-upload-text pointer-events-none select-none text-gray-500">点击选择文件，支持多选与拖入文件夹</p>
            </FilePicker>

            {files.length > 0 && (
                <div>
                    <div className="mt-5 flex justify-center gap-3">
                        <span className="flex items-center text-xs text-gray-700">
                            <span className="mr-1 h-[1em] w-[1em] bg-purple-200" />
                            重复&不合规
                        </span>
                        <span className="flex items-center text-xs text-gray-700">
                            <span className="mr-1 h-[1em] w-[1em] bg-amber-200" />
                            重复
                        </span>
                        <span className="flex items-center text-xs text-gray-700">
                            <span className="mr-1 h-[1em] w-[1em] bg-red-200" />
                            不合规
                        </span>
                        <span className="ml-auto text-xs text-gray-400">合规：图标名称必须以字母开头，只能包含字母、数字、下划线和中划线</span>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                        {files.map((file, index) => {
                            const isRepeat = repeatNames.includes(file.name);
                            const isInvalid = invalidNames.includes(file.name);
                            return (
                                <FontCard
                                    key={`${file.name}_${index}`}
                                    className={isRepeat && isInvalid ? "bg-purple-200" : isRepeat ? "bg-amber-200" : isInvalid ? "bg-red-200" : ""}
                                    name={file.name}
                                    icon={<span dangerouslySetInnerHTML={{ __html: file.svg }} />}
                                    onClickRemove={() => remove(index)}
                                    onEditConfirm={value => {
                                        setState({
                                            files: files.map((_, i) => (i === index ? { ..._, name: value } : _)),
                                        });
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </Modal>
    );
});
