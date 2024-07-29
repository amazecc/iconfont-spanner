/** 提取重复字符 */
export const findDuplicates = (arr: string[]) => {
    const charSet: Set<string> = new Set();
    const duplicates: string[] = [];
    arr.forEach(char => {
        if (charSet.has(char)) {
            duplicates.push(char);
        } else {
            charSet.add(char);
        }
    });
    return duplicates;
};

/** 合规字体名称 */
export const isValidFontName = (name: string) => /^[a-zA-Z][a-zA-Z-_\d]+$/.test(name);
