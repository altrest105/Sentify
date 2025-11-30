import { useState } from "react";
import styles from "./index.module.css";

function ReviewCard({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!review) return <div>Отзыв отсутствует</div>;

  const getSentimentText = (label) => {
    const sentiments = {
      0: "Нейтральный",
      1: "Положительный",
      2: "Негативный",
    };
    return sentiments[label] || label;
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`${styles.response} ${styles[`response__${review.label}`]}`}
      onClick={toggleExpand}
    >
      <div className={`${styles.text} ${isExpanded ? styles.expanded : styles.collapsed}`}>
        {review.text}
      </div>
      <p className={`semi-transparent ${styles.source}`}>
        <i>{review.src}</i> {/* ✅ Исправлено с source на src */}
      </p>
      <div className={`${styles.label} ${styles[`label__${review.label}`]}`}>
        {getSentimentText(review.label)}
      </div>
    </div>
  );
}

export default ReviewCard;