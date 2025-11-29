import styles from './index.module.css'

function ReviewCard({ review }) {
    if (!review) return <div>Отзыв отсутствует</div>

    const getSentimentText = (label) => {
        const sentiments = {
        "0": "Негативный",
        "1": "Нейтральный", 
        "2": "Положительный"
        };
        return sentiments[label] || label;
    };

    return (
        <div 
            key={review.ID} 
            className={`${styles.response} ${styles[`response__${review.label}`]}`}
        >
            <p className={styles.text}>{review.text}</p>
            <p className={`${styles['semi-transparent']} ${styles.text} ${styles.source}`}><i>{review.sources}</i></p>
            <div className={`${styles.text} ${styles.label} ${styles[`label__${review.label}`]}`}>{getSentimentText(review.label)}</div>
        </div>
    )
}

export default ReviewCard;