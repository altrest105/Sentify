import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { apiService } from "../../services/api-simple";
import styles from "./index.module.css";

function DownloadSection({ fileId, fileName }) {
  const { loading, error, callApi, clearError } = useApi();
  const [isDragging, setIsDragging] = useState(false); // Состояние для Drag & Drop

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

  // Обработчик загрузки валидационного файла (заглушка)
  const handleValidationFileUpload = (file) => {
    console.log("Validation file uploaded:", file.name);
    // Здесь будет логика отправки файла на сервер
    // Например: callApi(apiService.uploadValidationFile, file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidationFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleValidationFileUpload(e.target.files[0]);
    }
  };

  return (
    <div
      className={`${styles.left} panel text-align__center ${
        isDragging ? styles.dragging : ""
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="validation-file-upload"
        className={styles.fileInput}
        onChange={handleFileInputChange}
      />
      <label htmlFor="validation-file-upload" className={styles.fileLabel}>
        Загрузить валидационный файл
      </label>

      <button
        onClick={handleFileDownload}
        className={styles.fileLabel}
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
