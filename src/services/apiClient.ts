const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient ={
    async get <T>(endpoint: string): Promise <T>{
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching data from ${endpoint}: ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }
}