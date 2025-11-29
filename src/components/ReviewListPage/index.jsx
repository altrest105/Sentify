import styles from './index.module.css';
import ReviewCard from '../ReviewCard';

function ReviewListPage({ data }) {
  if (!data) return <div>Нет данных</div>;


  return (
    <div className={styles.rightPanel}>
      <div>
        <div className={styles.nav}>
          <button className={`${styles.text} ${styles.button} ${styles.navButton}`}>Список</button>
          <button className={`${styles.text} ${styles.button} ${styles.navButton}`}>Таблица</button>
          <button className={`${styles.text} ${styles.button} ${styles.navButton}`}>Диаграммы</button>
        </div>
        
        <h1 className={styles.text}>Название CSV файла</h1>
        <h2 className={styles.text}>Проанализировано {data.content?.length || 0} отзывов</h2>
      </div>
      
      <div className={styles.search}>
        <input
          type="text"
          className={`${styles.text} ${styles.semiTransparent}`}
          placeholder="Начните вводить текст..."
        />
        <img src="/search.svg" alt="Поиск" />
      </div>
      
      <div className={styles.filter}>
        <h2 className={styles.text}>Фильтрация</h2>
        <img src="/open-menu.svg" className={styles.open} alt="Открыть фильтр" />
      </div>
      
      <div className={styles.responses}>
        {data.content?.map(review => (
          <ReviewCard key={review.ID} review={review}/>
        ))}
      </div>
    </div>
  );
}

export default ReviewListPage;