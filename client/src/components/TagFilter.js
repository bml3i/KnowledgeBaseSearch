import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const TagFilter = ({ selectedTags, keyword, onTagSelect, onTagRemove, onClearAll, onKeywordChange }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState(keyword || '');
  const [isComposing, setIsComposing] = useState(false);
  
  const { getAuthHeaders } = useContext(AuthContext);

  useEffect(() => {
    fetchTags();
  }, [selectedTags, keyword]); // 当选中的标签或关键词变化时重新获取可用标签

  // 防抖处理关键词搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isComposing && inputValue !== keyword) {
        onKeywordChange(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isComposing, keyword, onKeywordChange]);

  const fetchTags = async () => {
    try {
      setIsLoadingTags(true);
      setError(null);
      
      // 构建请求参数，包含已选择的标签和关键词
      const params = {};
      if (selectedTags.length > 0) {
        params.selectedTags = selectedTags.join(',');
      }
      if (keyword && keyword.trim()) {
        params.keyword = keyword.trim();
      }
      
      const response = await axios.get('/api/tags', {
        ...getAuthHeaders(),
        params
      });
      
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to load tags. Please try again.');
    } finally {
      setIsLoadingTags(false);
    }
  };

  // 可用标签列表已经由后端过滤，不需要再次过滤已选择的标签

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    setInputValue(e.target.value);
  };

  const handleClearKeyword = () => {
    setInputValue('');
    onKeywordChange('');
  };

  return (
    <div className="search-container">
      <div className="keyword-filter">
        <div className="keyword-filter-row">
          <h3 className="keyword-title">Filter by Keyword</h3>
          <div className="keyword-input-container">
            <input
              type="text"
              className="keyword-input"
              placeholder={inputValue ? "输入关键词搜索记录内容..." : "Type a keyword to start searching..."}
              value={inputValue}
              onChange={handleInputChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
            />
            {inputValue && (
              <button className="clear-keyword-button" onClick={handleClearKeyword}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="filter-header-row">
        <h3 className="filter-title">Filter by Tags</h3>
        <div className="selected-tags">
          {selectedTags.length > 0 ? (
            selectedTags.map(tag => (
              <div key={tag} className="selected-tag">
                {tag}
                <span className="remove-tag" onClick={() => onTagRemove(tag)}>
                  ✕
                </span>
              </div>
            ))
          ) : (
            <div style={{ color: '#999' }}>No tags selected</div>
          )}
        </div>
        {selectedTags.length >= 2 && (
          <button className="clear-all-button" onClick={onClearAll}>
            Remove ✕
          </button>
        )}
      </div>
      
      {/* <h4>Available Tags</h4>> */}
      <div className="tag-list">
        {error ? (
          <div className="error">{error}</div>
        ) : isLoadingTags ? (
          <div>Loading tags...</div>
        ) : availableTags.length > 0 ? (
          availableTags.map(tag => (
            <div
              key={tag.name}
              className="tag"
              onClick={() => onTagSelect(tag.name)}
            >
              {tag.name}
              <span className="tag-count">({tag.count})</span>
            </div>
          ))
        ) : (
          <div>No more tags available</div>
        )}
      </div>
    </div>
  );
};

export default TagFilter;