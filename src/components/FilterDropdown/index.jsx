import { useState, useEffect } from 'react'
import styles from './index.module.css'

function FilterDropdown({ sentiments, sources, onFilterChange }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // ✅ ПРИ ЗАГРУЗКЕ ВСЕ ЧЕКБОКСЫ ВКЛЮЧЕНЫ
    const [selectedSentiments, setSelectedSentiments] = useState(
        sentiments.map(s => s.value)
    );
    const [selectedSources, setSelectedSources] = useState([...sources]);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen])

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleSentimentChange = (event) => {
        const value = event.target.value;
        const isChecked = event.target.checked;

        const newSelected = isChecked
            ? [...selectedSentiments, value]
            : selectedSentiments.filter(item => item !== value);

        setSelectedSentiments(newSelected);
    }

    const handleSourceChange = (event) => {
        const value = event.target.value;
        const isChecked = event.target.checked;

        const newSources = isChecked
            ? [...selectedSources, value]
            : selectedSources.filter(item => item !== value);

        setSelectedSources(newSources);
    }

    const selectAll = () => {
        const allSentiments = sentiments.map(s => s.value);
        setSelectedSentiments(allSentiments);
    }

    const handleApplyFilters = () => {
        // ✅ ПЕРЕДАЕМ ДАЖЕ ПУСТЫЕ ФИЛЬТРЫ
        onFilterChange({
            sentiments: selectedSentiments,
            sources: selectedSources
        })
        closeModal();
    }

    const clearAll = () => {
        setSelectedSentiments([])
    }

    return (
      <div>
        <div className={styles.filter} onClick={openModal}>
            <h2 className={styles.text}>Фильтрация</h2>
            <img src="/open-menu.svg" className={styles.open} alt="Открыть фильтр" />
        </div>
        
        {isModalOpen && (
            <div className={styles.modalOverlay} onClick={closeModal}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2>Фильтрация</h2>
                        <button className={styles.closeButton} onClick={closeModal}>×</button>
                    </div>

                    <div className={styles.modalBody}>
                        <div className={styles.filterGroup}>
                            <div className={styles.groupHeader}>
                                <h3>Тональность</h3>
                                <div className={styles.groupActions}>
                                    <button onClick={selectAll}>Все</button>
                                    <button onClick={clearAll}>Сбросить</button>
                                </div>
                            </div>
                            <div className={styles.checkboxGroup}>
                                {sentiments.map(sentiment => (
                                    <label key={sentiment.value} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            value={sentiment.value}
                                            checked={selectedSentiments.includes(sentiment.value)}
                                            onChange={handleSentimentChange}
                                        />
                                        <span>{sentiment.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <div className={styles.groupHeader}>
                                <h3>Источники</h3>
                                <div className={styles.groupActions}>
                                    <button onClick={() => setSelectedSources([...sources])}>Все</button>
                                    <button onClick={() => setSelectedSources([])}>Сбросить</button>
                                </div>
                            </div>
                            <div className={styles.checkboxGroup}>
                                {sources.map(source => (
                                    <label key={source} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            value={source}
                                            checked={selectedSources.includes(source)}
                                            onChange={handleSourceChange}
                                        />
                                        <span>{source}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button onClick={handleApplyFilters}>Применить</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    )
}

export default FilterDropdown;