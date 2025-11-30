import React from 'react';
import styles from './index.module.css';

function ReviewsTable({ data }) {
  if (!data?.content || data.content.length === 0) {
    return (
      <div className={styles.noData}>
        <div className={styles.noDataIcon}>📭</div>
        <h3>Отзывы не найдены</h3>
        <p>Нет данных для отображения в таблице</p>
      </div>
    );
  }

  const getRowClassName = (label) => {
    switch (label) {
      case "0": return styles.neutral; // Нейтральный
      case "1": return styles.positive; // Положительный
      case "2": return styles.negative; // Негативный
      default: return "";
    }
  };

  const getSentimentLabel = (label) => {
    switch (label) {
      case "0": return "Нейтральный";
      case "1": return "Положительный";
      case "2": return "Негативный";
      default: return label;
    }
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.gray}>
          <th className={styles.textAlignCenter}>Отзыв</th>
          <th>Тональность</th>
          <th>Источник</th>
        </tr>
      </thead>
      <tbody>
        {data.content.map((review) => (
          <tr key={review.ID} className={getRowClassName(review.label)}>
            <td className={styles.hotelCell}>
              {review.text}
            </td>
            <td>
              <span className={`${styles.tonalnostBadge} ${styles[`tonalnost-${review.label}`]}`}>
                {getSentimentLabel(review.label)}
              </span>
            </td>
            <td>{review.source}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ReviewsTable;