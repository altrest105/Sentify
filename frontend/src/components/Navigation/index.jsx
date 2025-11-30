import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

// Определяем вкладки, которые будут использоваться в навигации
const TABS = [
  { id: "list", name: "Список" },
  { id: "table", name: "Таблица" },
  { id: "diagrams", name: "Диаграммы" },
];

/**
 * Компонент панели навигации с анимацией скользящей подложки.
 * @param {object} props - Свойства компонента.
 * @param {function} props.onTabChange - Функция-обработчик при смене вкладки.
 */
function NavigationBar({ onTabChange }) {
  // 1. Состояние для активной вкладки (по умолчанию — "list")
  const [activeTabId, setActiveTabId] = useState(TABS[0].id);

  // 2. Ref для доступа к DOM-элементам кнопок
  const tabsRef = useRef([]);

  // 3. Состояние для стилей подложки (width и left)
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });

  // 4. Эффект для вычисления позиции подложки при изменении активной вкладки или размера окна
  useEffect(() => {
    const setTabPosition = () => {
      // Находим индекс активной вкладки
      const activeIndex = TABS.findIndex((tab) => tab.id === activeTabId);
      if (activeIndex === -1) return;

      // Получаем DOM-элемент активной кнопки
      const currentTab = tabsRef.current[activeIndex];

      if (currentTab) {
        // Устанавливаем ширину и горизонтальное смещение
        setUnderlineStyle({
          width: currentTab.clientWidth,
          left: currentTab.offsetLeft,
        });
      }
    };

    // Устанавливаем позицию при загрузке и смене вкладки
    setTabPosition();

    // Пересчитываем позицию при изменении размера окна
    window.addEventListener("resize", setTabPosition);
    return () => window.removeEventListener("resize", setTabPosition); // Очистка слушателя
  }, [activeTabId]); // Зависимость: эффект срабатывает при смене activeTabId

  const handleClick = (tabId) => {
    setActiveTabId(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    // navRelative обеспечивает position: relative для позиционирования подложки
    <div className={`${styles.nav} ${styles.navRelative}`}>
      {/* Элемент скользящей подложки */}
      <span
        className={styles.underline}
        style={{ left: underlineStyle.left, width: underlineStyle.width }}
      >
        <span className={styles.underlineBackground} />
      </span>

      {TABS.map((tab, index) => {
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            // Присваиваем Ref-ссылку элементу в массив
            ref={(el) => (tabsRef.current[index] = el)}
            // Применяем локальные стили и класс активности
            className={`${styles.button} ${styles.navButton} ${
              isActive ? styles.activeTab : ""
            }`}
            onClick={() => handleClick(tab.id)}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}

export default NavigationBar;
