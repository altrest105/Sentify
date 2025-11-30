import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { apiService } from "../../services/api";
import styles from "./index.module.css";

function DownloadSection({ fileId, fileName }) {
  const { loading, error, callApi, clearError } = useApi();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [metric, setMetric] = useState(null); // ✅ Добавляем состояние для метрики
  const [metricLoading, setMetricLoading] = useState(false);

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

  // ✅ Обновленный обработчик с получением метрики
  const handleValidationFileUpload = async (file) => {
    if (!fileId) {
      setUploadError("Сначала загрузите основной файл для анализа");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setMetric(null); // Сбрасываем предыдущую метрику

    try {
      // 1. Загружаем валидационный файл
      const result = await callApi(apiService.uploadSubmissionFile, file);
      console.log("Validation file uploaded successfully:", result);
      setUploadSuccess(true);
      
      if (result.file_id) {
        console.log("Submission file ID:", result.file_id);
        
        // 2. Получаем метрику после успешной загрузки
        setMetricLoading(true);
        try {
          const metricResult = await callApi(
            apiService.countMetric, 
            fileId, 
            result.file_id
          );
          console.log("Metric result:", metricResult);
          setMetric(metricResult.metric); // Сохраняем метрику
        } catch (metricError) {
          console.error("Metric calculation failed:", metricError);
          setUploadError(`Файл загружен, но ошибка расчета метрики: ${metricError.message}`);
        } finally {
          setMetricLoading(false);
        }
      }
    } catch (err) {
      console.error("Validation file upload failed:", err);
      setUploadError(err.message || "Ошибка при загрузке файла");
    } finally {
      setUploadLoading(false);
    }
  };

  // ... остальные обработчики без изменений
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
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleValidationFileUpload(file);
      } else {
        setUploadError("Пожалуйста, загрузите CSV файл");
      }
      e.dataTransfer.clearData();
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleValidationFileUpload(file);
      } else {
        setUploadError("Пожалуйста, загрузите CSV файл");
      }
      e.target.value = "";
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
        accept=".csv,text/csv"
        disabled={uploadLoading || !fileId}
      />
      <label 
        htmlFor="validation-file-upload" 
        className={styles.fileLabel}
        style={{ opacity: (!fileId || uploadLoading) ? 0.6 : 1 }}
      >
        {uploadLoading ? "Загрузка..." : "Загрузить валидационный файл"}
      </label>

      <button
        onClick={handleFileDownload}
        className={styles.fileLabel}
        disabled={loading || !fileId}
        style={{ opacity: (!fileId || loading) ? 0.6 : 1 }}
      >
        {loading ? "Скачиваем..." : "Скачать файл"}
      </button>

      {/* Статус загрузки и метрика */}
      {uploadSuccess && (
        <div style={{ 
          color: 'green', 
          margin: '10px 0',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          ✅ Файл успешно загружен!
        </div>
      )}

      {metricLoading && (
        <div style={{ 
          color: '#5b422c', 
          margin: '10px 0',
          fontSize: '14px'
        }}>
          ⏳ Расчет метрики...
        </div>
      )}

      {metric !== null && (
        <div style={{ 
          color: '#2e7d32', 
          margin: '10px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '10px',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          borderRadius: '8px'
        }}>
          📊 Метрика: {metric}
        </div>
      )}
      
      {uploadError && (
        <div style={{ 
          color: 'red', 
          margin: '10px 0',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          ❌ {uploadError}
        </div>
      )}

      <p className={`semi-transparent`}>
        Обновите страницу, чтобы очистить данные
      </p>
    </div>
  );
}

export default DownloadSection;