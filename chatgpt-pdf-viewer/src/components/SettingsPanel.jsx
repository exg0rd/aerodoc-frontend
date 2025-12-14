import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

const SettingsPanel = ({ 
  searchResultsCount, 
  setSearchResultsCount, 
  useGraphRAG, 
  setUseGraphRAG, 
  detectContradictions, 
  setDetectContradictions 
}) => {
  const [isExpanded, setIsExpanded] = useState({
    settings: true,
    systemInfo: true
  });

  const toggleSection = (section) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="settings-panel">
      {/* Settings Section */}
      <div className="settings-section">
        <div 
          className="section-header" 
          onClick={() => toggleSection('settings')}
        >
          <span className="section-icon">⚙️</span>
          <h3>Настройки</h3>
          <span className="section-toggle">{isExpanded.settings ? '−' : '+'}</span>
        </div>
        
        {isExpanded.settings && (
          <div className="section-content">
            <div className="setting-item">
              <label>Количество результатов поиска</label>
              <div className="slider-container">
                <span>1</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={searchResultsCount}
                  onChange={(e) => setSearchResultsCount(parseInt(e.target.value))}
                  className="slider"
                />
                <span>20</span>
              </div>
              <div className="slider-value">Значение: {searchResultsCount}</div>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={useGraphRAG}
                  onChange={(e) => setUseGraphRAG(e.target.checked)}
                />
                Использовать Graph RAG
              </label>
              <span className={`toggle-status ${useGraphRAG ? 'enabled' : 'disabled'}`}>
                {useGraphRAG ? 'Включено' : 'Выключено'}
              </span>
            </div>
            
            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={detectContradictions}
                  onChange={(e) => setDetectContradictions(e.target.checked)}
                />
                Обнаружение противоречий
              </label>
              <span className={`toggle-status ${detectContradictions ? 'enabled' : 'disabled'}`}>
                {detectContradictions ? 'Включено' : 'Выключено'}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* System Information Section */}
      <div className="settings-section">
        <div 
          className="section-header" 
          onClick={() => toggleSection('systemInfo')}
        >
          <span className="section-icon">ℹ️</span>
          <h3>Информация о системе</h3>
          <span className="section-toggle">{isExpanded.systemInfo ? '−' : '+'}</span>
        </div>
        
        {isExpanded.systemInfo && (
          <div className="section-content">
            <ul className="system-info-list">
              <li><strong>Хост Qdrant:</strong> localhost</li>
              <li><strong>Порт Qdrant:</strong> 6333</li>
              <li><strong>Коллекция документов:</strong> documents</li>
              <li><strong>Коллекция графа:</strong> graph_chunks</li>
              <li><strong>Модель генерации:</strong> llama3.1</li>
              <li><strong>Модель эмбеддингов:</strong> bge-m3</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;