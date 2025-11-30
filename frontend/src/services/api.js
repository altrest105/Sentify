const API_BASE_URL = 'http://localhost:8000';

class ApiServices {
    constructor() {
        this.baseURL = API_BASE_URL;
        console.log('🔧 Real API Service initialized:', this.baseURL);

        this.uploadFile = this.uploadFile.bind(this);
        this.uploadSubmissionFile = this.uploadSubmissionFile.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        this.downloadResponseFile = this.downloadResponseFile.bind(this);
        this.downloadSubmissionFile = this.downloadSubmissionFile.bind(this);
        this.triggerDownload = this.triggerDownload.bind(this);
        this.filteredReviews = this.filteredReviews.bind(this);
        this.sortedReviews = this.sortedReviews.bind(this);
        this.searchReviews = this.searchReviews.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.countMetric = this.countMetric.bind(this);
    }

    async uploadFile(file) {
        console.log('📤 Uploading to:', `${this.baseURL}/upload_file`);
        
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
                console.warn('Failed to parse error response:', jsonError);
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return result;
    }

    async uploadSubmissionFile(file) {
        console.log('📤 Uploading submission file to:', `${this.baseURL}/upload_submission_file`);
        
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
        console.log('📥 Downloading from:', `${this.baseURL}/download_file/${file_id}`);
        
        const response = await fetch(`${this.baseURL}/download_file/${file_id}`, {
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

    async downloadResponseFile(file_id) {
        console.log('📥 Downloading response file from:', `${this.baseURL}/download_file/${file_id}/response_file`);
        
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
        console.log('📥 Downloading submission file from:', `${this.baseURL}/download_file/${file_id}/submission_file`);
        
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

        const response = await fetch(url, { method: 'GET' });

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
        const params = new URLSearchParams();
        params.append('sort_column', sortColumn);
        if (desc) {
            params.append('desc', 'true');
        }

        const url = `${this.baseURL}/sort_file/${fileId}?${params.toString()}`;
        console.log('Sort URL:', url);

        const response = await fetch(url, { method: 'GET' });

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

    async searchReviews(query, fileId) {
        const url = `${this.baseURL}/search_file/${fileId}?query=${encodeURIComponent(query)}`;
        console.log('Search URL:', url);

        const response = await fetch(url, { method: 'GET' });

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
        console.log('🗑️ Deleting file:', `${this.baseURL}/delete_file/${file_id}`);
        
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
        const params = new URLSearchParams();
        params.append('file_id', file_id);
        params.append('submission_file_id', submission_file_id);

        const url = `${this.baseURL}/count_metric?${params.toString()}`;
        console.log('Count metric URL:', url);

        const response = await fetch(url, { method: 'GET' });

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