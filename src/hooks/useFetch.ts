import { useState, useEffect, useCallback } from 'react';
import {useQuery} from '@tanstack/react-query';

export default function useFetch<T>(fetchFunction: () => Promise<T>, errorMessage: string,queryKey:readonly unknown[]) {
const {data, isLoading, error, refetch: load} = useQuery({queryKey: queryKey, queryFn: fetchFunction, retry: false});


//     const [data, setData] = useState<T | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//    const load= useCallback(async () => {
//         setError(null);
//                     try {
//                         setIsLoading(true);
//                         const data = await fetchFunction();
//                         setData(data);
//                     } catch  {
//                         setError(errorMessage);
//                     } finally {
//                         setIsLoading(false);
//                     }
//                 }, [fetchFunction, errorMessage]);
//     useEffect(() => {
//                 void load();
//             }, [load]);
    return { data, isLoading, error,refetch: load };
}


