import { useQuery } from '@tanstack/react-query';

export default function useFetch<T>(fetchFunction: () => Promise<T>, errorMessage: string, queryKey: readonly unknown[]) {
    const { data, isLoading, error, refetch } = useQuery({ queryKey, queryFn: fetchFunction, retry: false });
    return {
        data: data ?? null,
        isLoading,
        error: error ? errorMessage : null,
        refetch,
    };
}
