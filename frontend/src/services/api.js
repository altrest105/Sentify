import { mockApiService } from './mockApi';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const USE_MOCK_API = false;

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

    async uploadSubmissionFile(file) {
        if (this.useMock) {
            return mockApiService.uploadSubmissionFile(file);
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/upload_submission_file`, {
            method: 'POST',
            body: formData,
        });

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

    async downloadResponseFile(file_id) {
        if (this.useMock) {
            return mockApiService.downloadResponseFile(file_id);
        }

        const response = await fetch(`${this.baseURL}/download_file/${file_id}/response_file`, {
            method: 'GET',
        });

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

    async downloadSubmissionFile(file_id) {
        if (this.useMock) {
            return mockApiService.downloadSubmissionFile(file_id);
        }

        const response = await fetch(`${this.baseURL}/download_file/${file_id}/submission_file`, {
            method: 'GET',
        });

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

    async filteredReviews(filters, fileId) {
        if (this.useMock) {
            return mockApiService.filteredReviews(filters, fileId);
        }

        const params = new URLSearchParams();
        
        if (filters.sentiments && filters.sentiments.length > 0) {
            filters.sentiments.forEach(mood => {
                params.append('mood', mood);
            });
        }
        
        if (filters.sources && filters.sources.length > 0) {
            filters.sources.forEach(source => {
                params.append('sources', source);
            });
        }

        const url = `${this.baseURL}/filter_file/${fileId}?${params.toString()}`;
        console.log('Filter URL:', url);

        const response = await fetch(url, {
            method: 'GET',
        });

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

        const result = await response.json();
        return result;
    }

    async sortedReviews(sortColumn, fileId, desc = false) {
        if (this.useMock) {
            return mockApiService.sortedReviews(sortColumn, fileId, desc);
        }

        const params = new URLSearchParams();
        params.append('sort_column', sortColumn);
        if (desc) {
            params.append('desc', 'true');
        }

        const url = `${this.baseURL}/sort_file/${fileId}?${params.toString()}`;
        console.log('Sort URL:', url);

        const response = await fetch(url, {
            method: 'GET',
        });

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

        const result = await response.json();
        return result;
    }

    async deleteFile(file_id) {
        if (this.useMock) {
            return mockApiService.deleteFile(file_id);
        }

        const response = await fetch(`${this.baseURL}/delete_file/${file_id}`, {
            method: 'DELETE',
        });

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

        const result = await response.json();
        return result;
    }

    async countMetric(file_id, submission_file_id) {
        if (this.useMock) {
            return mockApiService.countMetric(file_id, submission_file_id);
        }

        const params = new URLSearchParams();
        params.append('file_id', file_id);
        params.append('submission_file_id', submission_file_id);

        const url = `${this.baseURL}/count_metric?${params.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
        });

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

        const result = await response.json();
        return result;
    }
}

export const apiService = new ApiServices();