export type WriteResult = {
    key: string;
    filePath: string;
    status: "written" | "updated" | "unchanged";
};
export declare function writeFiles(files: Record<string, string>, outputDir: string, projectName: string): WriteResult[];
//# sourceMappingURL=writer.d.ts.map