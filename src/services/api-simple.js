// src/services/api-simple.js
import { mockApiService } from './mockApi';

// ✅ Простой объект вместо класса
export const apiService = {
  async uploadFile(file) {
    console.log('🔄 UPLOAD FILE CALLED');
    
    // Всегда используем моки для тестирования
    return await mockApiService.uploadFile(file);
  },

  async downloadFile(file_id) {
    console.log('📥 DOWNLOAD FILE CALLED');
    return await mockApiService.downloadFile(file_id);
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