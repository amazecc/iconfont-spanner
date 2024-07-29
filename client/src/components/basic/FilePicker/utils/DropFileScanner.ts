export type FileEntry = FileSystemDirectoryEntry | FileSystemFileEntry;

export interface ScanOption {
    /** 可过滤掉不需要的文件 */
    filter?: (fullPath: string) => boolean;
}

/** 元素拖入文件扫描 */
export class DropFileScanner {
    private static isFileSystemDirectoryEntry = (entry: FileEntry): entry is FileSystemDirectoryEntry => entry.isDirectory;

    private dropElement: HTMLElement;

    constructor(dropElement: HTMLElement) {
        this.dropElement = dropElement;
    }

    private dropListenerList: ((e: DragEvent) => void)[] = [];

    private dragoverListenerList: ((e: DragEvent) => void)[] = [];

    /** 扫描文件，得到文件列表 */
    async scanFiles(item: FileEntry, filter?: (fullPath: string) => boolean): Promise<File[]> {
        const files: File[] = [];

        if (DropFileScanner.isFileSystemDirectoryEntry(item)) {
            const directoryReader = item.createReader();
            const entries = await new Promise<FileEntry[]>(resolve => {
                directoryReader.readEntries(entries => {
                    resolve(entries as FileEntry[]);
                });
            });
            const scannedFiles = await Promise.all(entries.map(entry => this.scanFiles(entry, filter)));
            files.push(...scannedFiles.flat());
        } else if (filter?.(item.fullPath) ?? true) {
            const file = await new Promise<File>(resolve => {
                item.file(resolve);
            });
            files.push(file);
        }

        return files;
    }

    /**
     * 添加文件扫描监听函数
     * @param callback 扫描到文件列表回调
     */
    addScanListener(callback: (files: File[]) => void, option?: ScanOption) {
        const dragoverListener = (e: DragEvent) => {
            e.preventDefault();
        };
        const dropListener = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) {
                const { items } = e.dataTransfer;
                Array.from(items).forEach(item => {
                    const entry = item.webkitGetAsEntry() as FileSystemDirectoryEntry | FileSystemFileEntry;
                    this.scanFiles(entry, option?.filter).then(callback);
                });
            }
        };
        this.dragoverListenerList.push(dragoverListener);
        this.dropListenerList.push(dropListener);
        this.dropElement.addEventListener("dragover", dragoverListener);
        this.dropElement.addEventListener("drop", dropListener);
    }

    /** 移除文件扫描监听函数 */
    removeScanListener() {
        this.dragoverListenerList.forEach(listener => {
            this.dropElement?.removeEventListener("dragover", listener);
        });
        this.dropListenerList.forEach(listener => {
            this.dropElement?.removeEventListener("drop", listener);
        });
    }
}
