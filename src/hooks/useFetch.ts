import { useState, useEffect, useCallback } from 'react';


export default function useFetch<T>(fetchFunction: () => Promise<T>, errorMessage: string) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
   const load= useCallback(async () => {
        setError(null);
                    try {
                        setIsLoading(true);
                        const data = await fetchFunction();
                        setData(data);
                    } catch  {
                        setError(errorMessage);
                    } finally {
                        setIsLoading(false);
                    }
                }, [fetchFunction, errorMessage]);
    useEffect(() => {
                void load();
            }, [load]);
    return { data, isLoading, error,refetch: load };
}


