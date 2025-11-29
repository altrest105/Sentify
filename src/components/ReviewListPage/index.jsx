import React, { useState } from "react";
import styles from "./index.module.css";
import ReviewCard from "../ReviewCard";
// ✅ ИСПРАВЛЕНИЕ: Путь к NavigationBar (выход из текущей папки, если структура: /components/ReviewListPage и /components/Navigation)
import NavigationBar from "../Navigation/index.jsx";

function ReviewListPage({ data }) {
  // 1. ✅ ХУК НА ВЕРХНЕМ УРОВНЕ: Состояние для активного вида (list, table, diagrams)
  const [activeView, setActiveView] = useState("list");

  if (!data) return <div>Нет данных</div>;

  // 2. ✅ ОПРЕДЕЛЕНИЕ ФУНКЦИИ-ОБРАБОТЧИКА
  const handleTabChange = (tabId) => {
    setActiveView(tabId);
    console.log(`Выбрана вкладка: ${tabId}`);
  };

  // 3. ✅ ЛОГИКА УСЛОВНОГО РЕНДЕРИНГА
  const renderContent = () => {
    switch (activeView) {
      case "table":
        return <div>Здесь будет Таблица отзывов.</div>;

      case "diagrams":
        return <div>Здесь будут Диаграммы.</div>;

      case "list":
      default:
        // Рендерим текущий список ReviewCard
        return (
          <div className={styles.responses}>
            {data.content?.map((review) => (
              <ReviewCard key={review.ID} review={review} />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={styles.rightPanel}>
      {/* Секция 1: Навигация и заголовки */}
      <div>
        <NavigationBar onTabChange={handleTabChange} />

        <h1>Название CSV файла</h1>
        <h2>Проанализировано {data.content?.length || 0} отзывов</h2>
      </div>

      {/* Секция 2: Поиск */}
      <div className={styles.search}>
        <input
          type="text"
          // Глобальный класс "semi-transparent" (без styles.)
          className={`semi-transparent`}
          placeholder="Начните вводить текст..."
        />
        <img src="/search.svg" alt="Поиск" />
      </div>

      {/* Секция 3: Фильтрация */}
      <div className={styles.filter}>
        <h2 className={styles.text}>Фильтрация</h2>
        <img
          src="/open-menu.svg"
          className={styles.open}
          alt="Открыть фильтр"
        />
      </div>

      {/* Секция 4: Отображение контента (Список, Таблица, Диаграммы) */}
      {renderContent()}
    </div>
  );
}

export default ReviewListPage;
