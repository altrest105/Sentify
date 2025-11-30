import React, { useState, useEffect, useCallback } from "react";
import styles from "./index.module.css";
import ReviewCard from "../ReviewCard";
import ReviewTable from "../ReviewTable";
import NavigationBar from "../Navigation/index.jsx";
import FilterDropdown from "../FilterDropdown/index.jsx";
import StatisticsCharts from "../StatisticsCharts";
import { apiService } from "../../services/api.js";
import { useApi } from "../../hooks/useApi";

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

function ReviewListPage({ data, fileId = "mock_file_id" }) {
  const [activeView, setActiveView] = useState("list");
  const [displayData, setDisplayData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { loading, error, callApi } = useApi();

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
        const result = await callApi(apiService.searchReviews, debouncedSearchQuery, fileId);
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
    
    if ((!filters.sentiments || filters.sentiments.length === 0) && 
        (!filters.sources || filters.sources.length === 0)) {
      console.log("🎛️ Все фильтры сброшены - показываем пустой результат");
      setDisplayData({
        content: [],
        statistic: { "0": 0, "1": 0, "2": 0 }
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

  const handleSort = useCallback((sortColumn, desc = false) => {
    if (!displayData?.content) return;

    const sortedContent = [...displayData.content].sort((a, b) => {
      let aValue = a[sortColumn === 'src' ? 'source' : sortColumn];
      let bValue = b[sortColumn === 'src' ? 'source' : sortColumn];
      
      if (sortColumn === 'label') {
        return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      } else {
        return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
    });

    setDisplayData({
      ...displayData,
      content: sortedContent
    });
  }, [displayData]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (!displayData) {
    return <div className={styles.loading}>Загрузка данных...</div>;
  }

  const uniqueSources = [...new Set(data.content?.map(review => review.source) || [])];
  
  const sentiments = [
    { value: "0", label: "Нейтральный" },
    { value: "1", label: "Положительный" }, 
    { value: "2", label: "Негативный" }
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
        return <ReviewTable data={displayData} />;

      case "diagrams":
        return (
          <div className={styles.diagramsView}>
            <StatisticsCharts statistic={displayData.statistic} />
            <div className={styles.chartsNote}>
              * Диаграммы показывают распределение тональностей отзывов
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
                    : 'Попробуйте изменить параметры фильтрации'
                  }
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
            👍 {displayData.statistic["1"]} | 😐 {displayData.statistic["0"]} | 👎 {displayData.statistic["2"]}
          </div>
        )}
        {searchQuery && (
          <div className={styles.searchInfo}>
            Поиск: "{searchQuery}"
          </div>
        )}
      </div>

      <div className={styles.search}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          className={`semi-transparent`}
          placeholder="Начните вводить текст для поиска..."
        />
        <img src="/search.svg" alt="Поиск" />
      </div>

      {/* ✅ Обновленная секция с кнопками */}
      <div className={styles.sortSection}>
        <FilterDropdown 
          sentiments={sentiments} 
          sources={uniqueSources} 
          onFilterChange={handleFilterChange} 
        />

        <div className={styles.sortButtons}>
          <button 
            className={styles.sortButton}
            onClick={() => handleSort('label')}
          >
            По тональности ↑
          </button>
          <button 
            className={styles.sortButton}
            onClick={() => handleSort('label', true)}
          >
            По тональности ↓
          </button>
          <button 
            className={styles.sortButton}
            onClick={() => handleSort('src')}
          >
            По источнику ↑
          </button>
          <button 
            className={styles.sortButton}
            onClick={() => handleSort('src', true)}
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
    </div>
  );
}

export default ReviewListPage;