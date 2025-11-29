import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { apiService } from "../../services/api-simple";
import styles from "./index.module.css";

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
    } catch (err) {
      console.error("Download failed: ", err);
    }
  };

  return (
    <div className={`${styles.left} panel text-align__center`}>
      <button
        onClick={handleFileDownload}
        className={`${styles.fileLabel}`}
        disabled={loading}
      >
        {loading ? "Скачиваем..." : "Скачать файл"}
      </button>
      <p className={`semi-transparent`}>
        Обновите страницу, чтобы очистить данные
      </p>
    </div>
  );
}

export default DownloadSection;
