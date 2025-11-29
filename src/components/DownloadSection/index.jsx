import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { apiService } from '../../services/api-simple';
import styles from './index.module.css';

function DownloadSection({ fileId, fileName }) {
    const { loading, error, callApi, clearError } = useApi();

    const handleFileDownload = async () => {
        if (!fileId) {
            clearError();
            return;
        }

        try {
            const blob = await callApi(apiService.downloadFile, fileId);

            const downloadName = fileName || `reviews_${fileId}.csv`;
            apiService.triggerDownload(blob, downloadName);
        } catch(err) {
            console.error('Download failed: ', err);
        }
    }

    return (
        <div className={styles.panel}>
            <button onClick={handleFileDownload} className={`${styles.fileLabel} ${styles.text}`}disabled={loading}>
                {loading ? 'Скачиваем...' : 'Скачать файл'}
            </button>
            <p className={`${styles.semiTransparent} ${styles.text}`}>Обновите страницу, чтобы очистить данные</p>
        </div>
    )
}

export default DownloadSection;