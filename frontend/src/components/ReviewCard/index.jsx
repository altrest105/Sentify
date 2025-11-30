import styles from "./index.module.css";

function ReviewCard({ review }) {
  if (!review) return <div>Отзыв отсутствует</div>;

  const getSentimentText = (label) => {
    const sentiments = {
      0: "Нейтральный",
      1: "Положительный",
      2: "Негативный",
    };
    return sentiments[label] || label;
  };

  return (
    <div
      key={review.ID}
      className={`${styles.response} ${styles[`response__${review.label}`]}`}
    >
      <p>{review.text}</p>
      <p className={`semi-transparent  ${styles.source}`}>
        <i>{review.source}</i>
      </p>
      <div className={`${styles.label} ${styles[`label__${review.label}`]}`}>
        {getSentimentText(review.label)}
      </div>
    </div>
  );
}

export default ReviewCard;
