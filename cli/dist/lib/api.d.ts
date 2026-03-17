type ApiResponse<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
    code: string;
};
export declare function startBrowserAuth(): Promise<ApiResponse<{
    sessionId: string;
    confirmUrl: string;
    expiresAt: string;
}>>;
export declare function pollBrowserAuth(sessionId: string): Promise<ApiResponse<{
    confirmed: boolean;
    token?: string;
}>>;
export declare function verifyApiKey(token: string): Promise<ApiResponse<{
    userId: string;
    name: string;
    email: string;
}>>;
export type Project = {
    id: string;
    name: string;
    description: string | null;
    stack: string;
};
export declare function fetchProjects(token: string): Promise<ApiResponse<Project[]>>;
export type PullResult = {
    version: string;
    contractId: string;
    projectName: string;
    files: Record<string, string>;
};
export declare function pullContract(token: string, projectId: string, outputs: string[]): Promise<ApiResponse<PullResult>>;
export {};
//# sourceMappingURL=api.d.ts.map