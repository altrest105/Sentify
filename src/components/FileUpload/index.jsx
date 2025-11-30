import { useApi } from "../../hooks/useApi";
import { apiService } from "../../services/api-simple";
import { useState } from "react";
import styles from "./index.module.css";

function FileUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false); // 💡 Состояние для Drag & Drop
  const { loading, error, callApi, clearError } = useApi();

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      console.warn("Выбранный файл не является CSV.");
      clearError();
      return;
    }

    setFile(selectedFile);
    clearError();

    try {
      const result = await callApi(apiService.uploadFile, selectedFile);

      if (result.file_id) {
        onSuccess(result);
      } else {
        throw new Error(`Ошибка при обработке файла`);
      }
    } catch (err) {
      console.error("Upload error: ", err);
    }
  };

  // 💡 1. Обработчики Drag and Drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Проверяем, что есть перетаскиваемые элементы, чтобы избежать срабатывания на дочерних элементах
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Используем `e.currentTarget` (элемент, к которому привязан обработчик)
    // и `e.target` (элемент, с которого ушел курсор) для корректного сброса
    if (e.target === e.currentTarget) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // При DragOver мы хотим, чтобы стиль сохранялся
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false); // Сброс стиля

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className={`panel ${styles.fileUploadContainer} ${
        isDragging ? styles.dragging : ""
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h1 className={`text-align__center`}>
        Перетащите <b>тестовый</b> CSV файл или выберите файл для загрузки
      </h1>

      <div>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          id="file-input"
          className={styles.fileInput}
        />
        <label htmlFor="file-input" className={styles.fileLabel}>
          {loading ? "Загружаем..." : "Загрузить файл"}
        </label>
      </div>
    </div>
  );
}

export default FileUpload;
