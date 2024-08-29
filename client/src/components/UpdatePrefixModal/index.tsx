import React from "react";
import { message, Modal, Form, Input, Alert } from "antd";
import { updatePrefix } from "src/api/updatePrefix";
import { isValidFontName } from "src/utils";

export interface UpdatePrefixModalProps {
    open?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

interface FormState {
    newPrefix?: string;
    oldPrefix?: string;
}

export const UpdatePrefixModal: React.FC<UpdatePrefixModalProps> = React.memo(({ open, onClose, onSuccess }) => {
    const [form] = Form.useForm<FormState>();

    const submit = async () => {
        const values = await form.validateFields();
        await updatePrefix(values.newPrefix!, values.oldPrefix || undefined);
        message.success("前缀设置成功");
        onSuccess?.();
    };

    const reset = () => form.resetFields();

    return (
        <Modal title="设置前缀" open={open} onCancel={onClose} onOk={submit} afterClose={reset}>
            <Alert type="info" message="注：修改前缀后，同时会修改文件名称" className="mb-6 mt-4 text-slate-500" />
            <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Form.Item
                    label="新前缀"
                    name="newPrefix"
                    required
                    rules={[
                        {
                            validator: (_, value) => {
                                console.log("value", value);
                                if (!value?.trim()) {
                                    return Promise.reject(new Error("请输入新前缀"));
                                }
                                if (!isValidFontName(value)) {
                                    return Promise.reject(new Error("格式错误，如：icon-"));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Input placeholder="请输入新前缀，如：icon-" />
                </Form.Item>
                <Form.Item
                    label="旧前缀"
                    name="oldPrefix"
                    rules={[
                        {
                            validator: (_, value) => {
                                if (!isValidFontName(value)) {
                                    return Promise.reject(new Error("格式错误，例：icon-，icon_"));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Input placeholder="旧前缀将替换为新前缀" />
                </Form.Item>
            </Form>
        </Modal>
    );
});
