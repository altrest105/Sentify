import React from "react";
import styles from "./index.module.css";

const StatisticsCharts = ({ statistic, className = "" }) => {
  if (!statistic) return null;

  const total = Object.values(statistic).reduce((sum, count) => sum + count, 0);
  
  const chartData = [
    { 
      label: "Положительный", 
      value: statistic["1"] || 0, 
      color: "positive", 
      shortLabel: "Положит."
    },
    { 
      label: "Нейтральный", 
      value: statistic["0"] || 0, 
      color: "neutral", 
      shortLabel: "Нейтрал."
    },
    { 
      label: "Негативный", 
      value: statistic["2"] || 0, 
      color: "negative", 
      shortLabel: "Негатив."
    }
  ];

  // Рассчитываем проценты
  const dataWithPercentages = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
  }));

  // Для круговой диаграммы
  const calculatePieChart = () => {
    let currentAngle = 0;
    return dataWithPercentages.map(item => {
      if (item.percentage === 0) return null;
      
      const angle = (item.percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      // Конвертируем углы в координаты для path
      const x1 = 50 + 40 * Math.cos(Math.PI * startAngle / 180);
      const y1 = 50 + 40 * Math.sin(Math.PI * startAngle / 180);
      const x2 = 50 + 40 * Math.cos(Math.PI * (startAngle + angle) / 180);
      const y2 = 50 + 40 * Math.sin(Math.PI * (startAngle + angle) / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');
      
      return {
        ...item,
        pathData,
        startAngle,
        angle
      };
    }).filter(Boolean);
  };

  const pieData = calculatePieChart();

  return (
    <div className={`${styles.chartsContainer} ${className}`}>
      {/* Диаграммы в одну линию */}
      <div className={styles.chartsRow}>
        {/* Столбчатая диаграмма */}
        <div className={styles.chartSection}>
          <h4>Столбчатая диаграмма</h4>
          <div className={styles.barChart}>
            {dataWithPercentages.map((item, index) => (
              <div key={index} className={styles.barItem}>
                <div className={styles.barWrapper}>
                  <div 
                    className={`${styles.bar} ${styles[item.color]}`}
                    style={{ height: `${Math.max(item.percentage, 5)}%` }}
                    title={`${item.label}: ${item.value} (${item.percentage}%)`}
                  >
                    <span className={styles.barPercentage}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className={styles.barLabel}>
                  {item.shortLabel}
                </div>
                <div className={styles.barCount}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Круговая диаграмма */}
        <div className={styles.chartSection}>
          <h4>Круговая диаграмма</h4>
          <div className={styles.pieChartContainer}>
            <svg 
              width="200" 
              height="200" 
              viewBox="0 0 100 100" 
              className={styles.pieChart}
            >
              {pieData.map((item, index) => (
                <path
                  key={index}
                  d={item.pathData}
                  className={`${styles.pieSlice} ${styles[item.color]}`}
                  fill="none"
                  strokeWidth="30"
                />
              ))}
              {total === 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#666"
                  strokeWidth="30"
                />
              )}
            </svg>
            <div className={styles.pieCenter}>
              <span className={styles.totalCount}>{total}</span>
              <span className={styles.totalLabel}>всего</span>
            </div>
          </div>
        </div>
      </div>

      {/* Легенда снизу */}
      <div className={styles.legend}>
        <h4>Легенда</h4>
        <div className={styles.legendItems}>
          {dataWithPercentages.map((item, index) => (
            <div key={index} className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles[item.color]}`}></div>
              <span className={styles.legendLabel}>{item.label}</span>
              <span className={styles.legendValue}>
                {item.value} ({item.percentage}%)
              </span>
            </div>
          ))}
          <div className={styles.legendTotal}>
            <div className={styles.legendColor} style={{background: '#888'}}></div>
            <span className={styles.legendLabel}>Всего отзывов</span>
            <span className={styles.legendValue}>{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCharts;