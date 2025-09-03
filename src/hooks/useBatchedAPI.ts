import { useCallback } from 'react';

interface BatchOperation<T = unknown> {
    id: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    resolve: (data: T) => void;
    reject: (error: Error) => void;
}

class APIBatcher {
    private operations: BatchOperation<unknown>[] = [];
    private timer: NodeJS.Timeout | null = null;
    private readonly batchDelay: number;
    private readonly maxBatchSize: number;

    constructor(batchDelay: number = 500, maxBatchSize: number = 10) {
        this.batchDelay = batchDelay;
        this.maxBatchSize = maxBatchSize;
    }

    add<T>(operation: Omit<BatchOperation<T>, 'resolve' | 'reject'>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.operations.push({
                ...operation,
                resolve: resolve as (data: unknown) => void,
                reject,
            } as BatchOperation<unknown>);

            // If we hit max batch size, execute immediately
            if (this.operations.length >= this.maxBatchSize) {
                this.executeBatch();
            } else {
                // Otherwise, schedule batch execution
                this.scheduleBatch();
            }
        });
    }

    private scheduleBatch() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            this.executeBatch();
        }, this.batchDelay);
    }

    private async executeBatch() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (this.operations.length === 0) return;

        const currentBatch = [...this.operations];
        this.operations = [];

        // Group operations by URL and method for potential optimization
        const groupedOps = this.groupOperations(currentBatch);

        // Execute all operations
        await Promise.all(
            Object.entries(groupedOps).map(([key, ops]) =>
                this.executeGroup(key, ops)
            )
        );
    }

    private groupOperations(operations: BatchOperation<unknown>[]): Record<string, BatchOperation<unknown>[]> {
        const groups: Record<string, BatchOperation<unknown>[]> = {};

        operations.forEach(op => {
            const key = `${op.method}:${op.url}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(op);
        });

        return groups;
    }

    private async executeGroup(key: string, operations: BatchOperation<unknown>[]) {
        const [method, url] = key.split(':');

        if (method === 'GET' && operations.length > 1) {
            // For GET requests, we can potentially optimize by making a single call
            // and sharing the result
            try {
                const response = await fetch(url);
                const data = await response.json();

                operations.forEach(op => op.resolve(data));
            } catch (error) {
                operations.forEach(op => op.reject(error as Error));
            }
        } else {
            // For other methods, execute individually but concurrently
            await Promise.all(
                operations.map(async (op) => {
                    try {
                        const response = await fetch(op.url, {
                            method: op.method,
                            headers: op.body ? { 'Content-Type': 'application/json' } : undefined,
                            body: op.body ? JSON.stringify(op.body) : undefined,
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }

                        const data = await response.json();
                        op.resolve(data);
                    } catch (error) {
                        op.reject(error as Error);
                    }
                })
            );
        }
    }
}

// Global batchers for different types of operations
const readBatcher = new APIBatcher(200, 5);  // Fast batching for reads
const writeBatcher = new APIBatcher(1000, 3); // Slower batching for writes

export function useBatchedAPI() {
    const batchedFetch = useCallback(async <T>(
        url: string,
        options: RequestInit & { batch?: boolean } = {}
    ): Promise<T> => {
        const { batch = true, ...fetchOptions } = options;

        if (!batch) {
            // If batching is disabled, make direct request
            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        }

        const method = (fetchOptions.method || 'GET').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE';
        const batcher = ['GET'].includes(method) ? readBatcher : writeBatcher;

        return batcher.add<T>({
            id: `${method}:${url}:${Date.now()}:${Math.random()}`,
            url,
            method,
            body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : undefined,
        });
    }, []);

    return { batchedFetch };
}
