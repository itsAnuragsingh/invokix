export type InvokixConfig = {
    projectId: string;
    contractId: string;
    outputDir: string;
    outputs: string[];
};
export declare function readConfig(): InvokixConfig | null;
export declare function writeConfig(config: InvokixConfig): void;
export declare function configExists(): boolean;
type AuthData = {
    token: string;
    email: string;
    name: string;
};
export declare function readAuth(): AuthData | null;
export declare function writeAuth(data: AuthData): void;
export declare function clearAuth(): void;
export declare function isAuthenticated(): boolean;
export {};
//# sourceMappingURL=config.d.ts.map