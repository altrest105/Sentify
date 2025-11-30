import { useApi } from "../../hooks/useApi";
import { apiService } from "../../services/api";
import { useState } from "react";
import styles from "./index.module.css";

function FileUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const { loading, error, callApi, clearError } = useApi();

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile?.name.endsWith(".csv")) {
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

  return (
    <div>
      <div className={`panel`}>
        <h1 className={`text-align__center`}>
          Перетащите CSV файл или выберите файл для загрузки
        </h1>
        <h2 className={`semi-transparent text-align__center`}>
          Вы можете загрузить:
        </h2>
        <ul>
          <li className={`semi-transparent`}>
            <b>Тестовый файл</b> с 2 столбцами: отзыв и источник. Система
            вычислит тональность отзыва и визуализирует результаты в виде
            списка, таблицы или диаграммы.
          </li>
          <li className={`semi-transparent`}>
            <b>Валидационный файл</b> с 3 столбцами: отзыв, источник и
            тональность. Система вычислит тональности, визуализирует результаты
            в виде списка, таблицы или диаграммы, а также сравнит эти данные с
            валидационными и выведет показатель метрики.
          </li>
        </ul>

        <div>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            id="file-input"
            className={styles.fileInput}
          />
          <label htmlFor="file-input" className={`${styles.fileLabel} `}>
            Загрузить файл
          </label>
        </div>
      </div>
      <div className={`panel`}></div>
    </div>
  );
}

export default FileUpload;
