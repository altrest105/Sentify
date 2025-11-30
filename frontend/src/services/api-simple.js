import { mockApiService } from './mockApi';

export const apiService = {
  async uploadFile(file) {
    console.log('🔄 UPLOAD FILE CALLED');
    return await mockApiService.uploadFile(file);
  },

  async downloadFile(file_id) {
    console.log('📥 DOWNLOAD FILE CALLED');
    return await mockApiService.downloadFile(file_id);
  },

  async filteredReviews(filters, fileId) {
    console.log('🎛️ FILTERED REVIEWS CALLED', filters, fileId);
    return await mockApiService.filteredReviews(filters, fileId);
  },

  async searchReviews(query, fileId) {
    console.log('🔍 SEARCH REVIEWS CALLED', query, fileId);
    return await mockApiService.searchReviews(query, fileId);
  },

  triggerDownload(blob, fileName = 'file.csv') {
    console.log('💾 TRIGGER DOWNLOAD CALLED');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};