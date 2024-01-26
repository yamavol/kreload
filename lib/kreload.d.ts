export interface ClientOptions {
    port?: number;
    verbose?: boolean;
}
export interface WatcherOptions {
    port?: number;
    watch: string[];
    verbose?: boolean;
}
/**
 * Return a client-side javascript code for hot-reloading
 */
export declare function getReloadScript(options?: ClientOptions): Promise<string>;
/**
 * Launch WebSocketServer and start FileSystem monitoring.
 */
export declare function startWatcher(option: WatcherOptions): void;
//# sourceMappingURL=kreload.d.ts.map