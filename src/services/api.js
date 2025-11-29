import { mockApiService } from './mockApi';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const USE_MOCK_API = true;

class ApiServices {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.useMock = USE_MOCK_API;
        
        if (this.useMock) {
            console.log('Using Mock API for testing');
        }
    }

    async uploadFile(file) {
        if (this.useMock) {
            return mockApiService.uploadFile(file);
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/upload_file`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = `HTTP error! Status: ${response.status}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                console.warn('Failed to parse error response:', jsonError)
            }
            
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return result;
    }

    async downloadFile(file_id) {
        if (this.useMock) {
            return mockApiService.downloadFile(file_id);
        }

        const response = await fetch(`${this.baseURL}/download_file/${file_id}`, {
            method: 'GET',
        })

        if (!response.ok) {
            let errorMessage = `HTTP error! Status: ${response.status}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                console.warn('Failed to parse error response:', jsonError);
            }
            throw new Error(errorMessage);
        }

        const blob = await response.blob();
        return blob;
    }

    async triggerDownload(blob, fileName = 'file.csv') {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

export const apiService = new ApiServices();
