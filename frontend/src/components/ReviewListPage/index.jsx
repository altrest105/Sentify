import React, { useState, useEffect, useCallback } from "react";
import styles from "./index.module.css"; // Используется один раз
import ReviewCard from "../ReviewCard";
import ReviewTable from "../ReviewTable";
import NavigationBar from "../Navigation/index.jsx";
import FilterDropdown from "../FilterDropdown/index.jsx";
import { apiService } from "../../services/api.js";
import { useApi } from "../../hooks/useApi";

// Вспомогательная функция для Debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// ===============================================
// ⭐️ Настройки для диаграммы тональности
// ===============================================
const SENTIMENT_COLORS = {
  1: "rgba(74, 255, 0, 0.3)", // Положительный (Green/Lime - 0.15 opacity)
  0: "rgba(255, 198, 0, 0.3)", // Нейтральный (Yellow/Amber - 0.15 opacity)
  2: "rgba(255, 0, 0, 0.3)", // Негативный (Red - 0.15 opacity)
};

const SENTIMENT_LABELS = {
  1: "Положительные",
  0: "Нейтральные",
  2: "Негативные",
};

// ===============================================
// ⭐️ Вложенный компонент для круговой диаграммы тональности (SentimentPieChart)
// Использует стили из index.module.css
// ===============================================
const SentimentPieChart = ({ statistics }) => {
  if (!statistics) return null;

  const total = Object.values(statistics).reduce(
    (sum, count) => sum + count,
    0
  );

  if (total === 0) {
    return (
      <div className={styles.noDataChart}>
        Нет данных для построения диаграммы.
      </div>
    );
  }

  const segments = Object.keys(statistics).map((key) => {
    const count = statistics[key];
    const percentage = (count / total) * 100;
    const color = SENTIMENT_COLORS[key] || "#cccccc";
    const label = `${SENTIMENT_LABELS[key]} (${count}, ${percentage.toFixed(
      1
    )}%)`;

    return { key, count, percentage, color, label };
  });

  // Вычисляем CSS для conic-gradient, чтобы сымитировать круговую диаграмму
  let gradientStops = [];
  let currentPercentage = 0;

  segments.forEach((s) => {
    if (s.percentage > 0) {
      gradientStops.push(`${s.color} ${currentPercentage.toFixed(1)}%`);
      currentPercentage += s.percentage;
      gradientStops.push(`${s.color} ${currentPercentage.toFixed(1)}%`);
    }
  });

  const pieStyle = {
    background: `conic-gradient(${gradientStops.join(", ")})`,
  };

  return (
    <div className={styles.chartContainer}>
      <h3>Распределение по тональности</h3>
      <div className={styles.pieChartPlaceholder} style={pieStyle}>
        <div className={styles.centerText}>
          Всего:
          <br />
          {total}
        </div>
      </div>
      <div className={styles.legend}>
        {segments.map((s) => (
          <div key={s.key} className={styles.legendItem}>
            <span
              className={styles.colorBox}
              style={{ backgroundColor: s.color }}
            ></span>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ===============================================
// ⭐️ Вложенный компонент для столбчатой диаграммы источников (SourcesBarChart)
// Использует стили из index.module.css
// ===============================================
const SourcesBarChart = ({ content }) => {
  if (!content || content.length === 0) return null;

  // 1. Сбор данных по источникам
  const sourceCounts = content.reduce((acc, review) => {
    acc[review.source] = (acc[review.source] || 0) + 1;
    return acc;
  }, {});

  const sortedSources = Object.entries(sourceCounts).sort(
    ([, a], [, b]) => b - a
  );

  const maxCount = sortedSources.length > 0 ? sortedSources[0][1] : 0;

  return (
    <div className={styles.chartContainer}>
      <h3>Распределение по источникам</h3>
      <div className={styles.barChart}>
        {sortedSources.map(([source, count]) => {
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div key={source} className={styles.barItem}>
              <div className={styles.barLabel}>{source}</div>
              <div className={styles.barWrapper}>
                <div
                  className={styles.bar}
                  style={{ width: `${barWidth}%` }}
                ></div>
                <div className={styles.barCount}>{count}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function ReviewListPage({ data, fileId = "mock_file_id" }) {
  const [activeView, setActiveView] = useState("list");
  const [displayData, setDisplayData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { loading, error, callApi } = useApi();

  const [isVisible, setIsVisible] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (data) {
      setDisplayData(data);
    }
  }, [data]);

  useEffect(() => {
    if (debouncedSearchQuery.trim() === "") {
      setDisplayData(data);
      return;
    }

    const performSearch = async () => {
      try {
        const result = await callApi(
          apiService.searchReviews,
          debouncedSearchQuery,
          fileId
        );
        setDisplayData(result);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, data, fileId, callApi]);

  const handleTabChange = (tabId) => {
    setActiveView(tabId);
    console.log(`Выбрана вкладка: ${tabId}`);
  };

  const handleFilterChange = async (filters) => {
    console.log("🎛️ Выбранные фильтры:", filters);

    if (
      (!filters.sentiments || filters.sentiments.length === 0) &&
      (!filters.sources || filters.sources.length === 0)
    ) {
      console.log("🎛️ Все фильтры сброшены - показываем пустой результат");
      setDisplayData({
        content: [],
        statistic: { 0: 0, 1: 0, 2: 0 },
      });
      return;
    }

    try {
      const result = await callApi(apiService.filteredReviews, filters, fileId);
      setDisplayData(result);
    } catch (error) {
      console.error("Filter error:", error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSort = useCallback(
    (sortColumn, desc = false) => {
      if (!displayData?.content) return;

      const sortedContent = [...displayData.content].sort((a, b) => {
        let aValue = a[sortColumn === "src" ? "source" : sortColumn];
        let bValue = b[sortColumn === "src" ? "source" : sortColumn];

        // Обработка сортировки для строковых значений
        if (sortColumn === "label" || sortColumn === "src") {
          return desc
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }

        // Для числовых значений (если бы они были)
        return desc ? bValue - aValue : aValue - bValue;
      });

      setDisplayData({
        ...displayData,
        content: sortedContent,
      });
    },
    [displayData]
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (!displayData) {
    return <div className={styles.loading}>Загрузка данных...</div>;
  }

  const uniqueSources = [
    ...new Set(data.content?.map((review) => review.source) || []),
  ];

  const sentiments = [
    { value: "0", label: "Нейтральный" },
    { value: "1", label: "Положительный" },
    { value: "2", label: "Негативный" },
  ];

  const renderContent = () => {
    if (loading) {
      return <div className={styles.loading}>🔄 Загрузка...</div>;
    }

    if (error) {
      return <div className={styles.error}>Ошибка: {error}</div>;
    }

    switch (activeView) {
      case "table":
        return <ReviewTable data={displayData} onSort={handleSort} />;

      case "diagrams":
        // Рендеринг диаграмм
        return (
          <div className={styles.diagramsContainer}>
            <h1>📊 Визуализация данных</h1>
            <div className={styles.chartsWrapper}>
              <SentimentPieChart statistics={displayData.statistic} />
              <SourcesBarChart content={displayData.content} />
            </div>
          </div>
        );

      case "list":
      default:
        return (
          <div className={styles.responses}>
            {displayData.content?.length > 0 ? (
              displayData.content.map((review) => (
                <ReviewCard key={review.ID} review={review} />
              ))
            ) : (
              <div className={styles.noData}>
                <div className={styles.noDataIcon}>📭</div>
                <h3>Отзывы не найдены</h3>
                <p>
                  {searchQuery
                    ? `По запросу "${searchQuery}" ничего не найдено`
                    : "Попробуйте изменить параметры фильтрации"}
                </p>
                <button
                  className={styles.resetButton}
                  onClick={() => {
                    setSearchQuery("");
                    setDisplayData(data);
                  }}
                >
                  Показать все отзывы
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={styles.rightPanel}>
      <div>
        <NavigationBar onTabChange={handleTabChange} />
        <h1>Анализ отзывов</h1>
        <h2>Отзывов: {displayData.content?.length || 0}</h2>
        {displayData.statistic && (
          <div className={styles.stats}>
            👍 {displayData.statistic["1"]} | 😐 {displayData.statistic["0"]} |
            👎 {displayData.statistic["2"]}
          </div>
        )}
        {searchQuery && (
          <div className={styles.searchInfo}>Поиск: "{searchQuery}"</div>
        )}
      </div>
      <div className={styles.search}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          className={`semi-transparent`}
          placeholder="Поиск..."
        />
        <img src="/search.svg" alt="Поиск" />
      </div>
      {/* ✅ Секция с фильтром и кнопками сортировки */}
      <div className={styles.sortSection}>
        <FilterDropdown
          sentiments={sentiments}
          sources={uniqueSources}
          onFilterChange={handleFilterChange}
        />

        <div className={styles.sortButtons}>
          <button
            className={styles.sortButton}
            onClick={() => handleSort("label")}
          >
            По тональности ↑
          </button>
          <button
            className={styles.sortButton}
            onClick={() => handleSort("label", true)}
          >
            По тональности ↓
          </button>
          <button
            className={styles.sortButton}
            onClick={() => handleSort("src")}
          >
            По источнику ↑
          </button>
          <button
            className={styles.sortButton}
            onClick={() => handleSort("src", true)}
          >
            По источнику ↓
          </button>
        </div>

        <button
          className={styles.resetAllButton}
          onClick={() => {
            setSearchQuery("");
            setDisplayData(data);
          }}
        >
          Сбросить все
        </button>
      </div>
      {renderContent()}
      <button
        onClick={scrollToTop}
        className={`${styles.backToTop} ${isVisible ? styles.visible : ""}`}
        aria-label="Вернуться наверх страницы"
      >
        &#9650; {/* Символ стрелки вверх */}
      </button>
    </div>
  );
}

export default ReviewListPage;