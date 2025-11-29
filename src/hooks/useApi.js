// import { useState, useCallback } from 'react';

// export const useApi = () => {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const callApi = useCallback(async (apiCall, ...args) => {
//         setLoading(true);
//         setError(null);

//         try {
//             const result = await apiCall(...args);
//             return result;
//         } catch (err) {
//             setError(err.message);
//             throw err;
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     const clearError = useCallback(() => {
//         setError(null);
//     }, []);

//     return {
//         loading,
//         error,
//         callApi,
//         clearError
//     }
// }

// src/hooks/useApi.js
import { useState, useCallback } from 'react';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callApi = useCallback(async (apiCall, ...args) => {
        console.log('🔄 useApi.callApi called');
        setLoading(true);
        setError(null);

        try {
            console.log('Executing API call...');
            const result = await apiCall(...args);
            console.log('API call result:', result);
            return result;
        } catch (err) {
            console.error('API call error:', err);
            setError(err.message);
            throw err;
        } finally {
            console.log('API call finished');
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        callApi,
        clearError
    };
};