import { useEffect, useRef, useCallback } from 'react';

// Custom hook để debounce API calls
export function useDebounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedFunc = useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            func(...args);
        }, delay);
    }, [func, delay]) as T;

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedFunc;
}

// Custom hook để throttle API calls  
export function useThrottle<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
): T {
    const lastCallRef = useRef<number>(0);

    const throttledFunc = useCallback((...args: Parameters<T>) => {
        const now = Date.now();

        if (now - lastCallRef.current >= delay) {
            lastCallRef.current = now;
            func(...args);
        }
    }, [func, delay]) as T;

    return throttledFunc;
}

// Custom hook để cache API results
export function useAPICache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
        cacheTime?: number; // Cache duration in ms
    } = {}
) {
    const { cacheTime = 30000 } = options; // Default 30s cache
    const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

    const getCachedData = useCallback(async (): Promise<T> => {
        const now = Date.now();

        // Check if we have valid cached data
        if (cacheRef.current && (now - cacheRef.current.timestamp < cacheTime)) {
            return cacheRef.current.data;
        }

        // Fetch new data
        const data = await fetcher();
        cacheRef.current = { data, timestamp: now };
        return data;
    }, [fetcher, cacheTime]);

    const invalidateCache = useCallback(() => {
        cacheRef.current = null;
    }, []);

    const forceRefresh = useCallback(async (): Promise<T> => {
        // Force refresh by invalidating cache first
        invalidateCache();
        return getCachedData();
    }, [getCachedData, invalidateCache]);

    return { getCachedData, invalidateCache, forceRefresh };
}
