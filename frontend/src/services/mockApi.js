// БОЛЬШИЕ МОК ДАННЫЕ ДЛЯ СКРОЛЛА
const generateMockReviews = () => {
  const sources = ['Amazon', 'Ozon', 'Wildberries', 'Yandex Market', 'AliExpress'];
  
  const sentiments = [
    { value: "0", label: "Нейтральный" },
    { value: "1", label: "Положительный" }, 
    { value: "2", label: "Негативный" }
  ];
  
  const reviews = [];
  
  for (let i = 1; i <= 50; i++) {
    const sentiment = sentiments[i % 3];
    const source = sources[i % 5];
    
    reviews.push({
      ID: i.toString(),
      text: generateReviewText(sentiment.label, source),
      label: sentiment.value,
      source: source
    });
  }
  
  return reviews;
};
 
const generateReviewText = (sentiment, source) => {
  const positiveTexts = [
    `Отличный товар с ${source}! Качество превзошло ожидания.`,
    `Потрясающее качество на ${source}. Рекомендую всем!`,
    `Прекрасный продукт с быстрой доставкой от ${source}.`,
    `Восхищен покупкой на ${source}! Все идеально.`,
    `Лучший товар на ${source} за последнее время.`
  ];
  
  const neutralTexts = [
    `Нормальный товар с ${source}. Ничего особенного.`,
    `Стандартное качество на ${source}. Цена соответствует.`,
    `Обычный продукт с ${source}. Без нареканий.`,
    `Средний товар на ${source}. Подходит для базовых нужд.`,
    `Ничего выдающегося на ${source}, но и плохого нет.`
  ];
  
  const negativeTexts = [
    `Ужасное качество с ${source}. Не рекомендую.`,
    `Разочарован покупкой на ${source}. Деньги на ветер.`,
    `Плохой товар с ${source}. Сломался сразу.`,
    `Некачественный продукт на ${source}. Возврат.`,
    `Ужасный сервис ${source}. Товар не соответствует.`
  ];
  
  const texts = {
    'Положительный': positiveTexts,
    'Нейтральный': neutralTexts,
    'Негативный': negativeTexts
  };
  
  const availableTexts = texts[sentiment];
  return availableTexts[Math.floor(Math.random() * availableTexts.length)];
};

// Кэш данных для быстрого доступа
let cachedData = null;

export const mockApiService = {
  async uploadFile(file) {
    // ✅ УБРАНА ЗАДЕРЖКА
    if (!cachedData) {
      const content = generateMockReviews();
      const statistic = {
        "0": content.filter(r => r.label === "0").length,
        "1": content.filter(r => r.label === "1").length,
        "2": content.filter(r => r.label === "2").length
      };
      
      cachedData = {
        file_id: `file_${Date.now()}`,
        statistic,
        content
      };
    }
    
    return cachedData;
  },

  async downloadFile(file_id) {
    // ✅ УБРАНА ЗАДЕРЖКА
    const csvData = "ID,text,label,source\n1,Test,1,Amazon";
    return new Blob([csvData], { type: 'text/csv;charset=utf-8' });
  },

  // ✅ ФИЛЬТРАЦИЯ БЕЗ ЗАДЕРЖКИ
  async filteredReviews(filters, fileId) {
    console.log('🎛️ Applying real filters:', filters);
    
    const uploadResult = await this.uploadFile();
    let filteredContent = [...uploadResult.content];
    
    if (filters.sentiments && filters.sentiments.length > 0) {
      filteredContent = filteredContent.filter(review => 
        filters.sentiments.includes(review.label)
      );
    }
    
    if (filters.sources && filters.sources.length > 0) {
      filteredContent = filteredContent.filter(review => 
        filters.sources.includes(review.source)
      );
    }
    
    console.log(`🎛️ Filter result: ${filteredContent.length} reviews`);
    
    return {
      content: filteredContent,
      statistic: {
        "0": filteredContent.filter(r => r.label === "0").length,
        "1": filteredContent.filter(r => r.label === "1").length,
        "2": filteredContent.filter(r => r.label === "2").length
      }
    };
  },

  // ✅ СОРТИРОВКА БЕЗ ЗАДЕРЖКИ
  async sortedReviews(sortColumn, fileId, desc = false) {
    console.log('🔽 Applying real sort:', sortColumn, desc);
    
    const uploadResult = await this.uploadFile();
    let sortedContent = [...uploadResult.content];
    
    sortedContent.sort((a, b) => {
      let aValue = a[sortColumn === 'src' ? 'source' : sortColumn];
      let bValue = b[sortColumn === 'src' ? 'source' : sortColumn];
      
      if (sortColumn === 'label') {
        return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      } else {
        return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
    });
    
    return {
      content: sortedContent
    };
  },

  // ✅ ПОИСК БЕЗ ЗАДЕРЖКИ
  async searchReviews(query, fileId) {
    console.log('🔍 Applying real search:', query);
    
    const uploadResult = await this.uploadFile();
    const searchedContent = uploadResult.content.filter(review =>
      review.text.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      content: searchedContent
    };
  }
};