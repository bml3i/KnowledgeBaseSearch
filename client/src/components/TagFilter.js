import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const TagFilter = ({ selectedTags, onTagSelect, onTagRemove }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [error, setError] = useState(null);
  
  const { getAuthHeaders } = useContext(AuthContext);

  useEffect(() => {
    fetchTags();
  }, [selectedTags]); // 当选中的标签变化时重新获取可用标签

  const fetchTags = async () => {
    try {
      setIsLoadingTags(true);
      setError(null);
      
      // 构建请求参数，包含已选择的标签
      const params = {};
      if (selectedTags.length > 0) {
        params.selectedTags = selectedTags.join(',');
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

  return (
    <div className="search-container">
      <h3>Filter by Tags</h3>
      
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
      
      <h4>Available Tags</h4>
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