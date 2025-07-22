import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const TagFilter = ({ selectedTags, onTagSelect, onTagRemove }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { getAuthHeaders } = useContext(AuthContext);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/tags', getAuthHeaders());
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to load tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out already selected tags
  const filteredTags = availableTags.filter(
    tag => !selectedTags.includes(tag.name)
  );

  if (isLoading) {
    return <div>Loading tags...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

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
        {filteredTags.length > 0 ? (
          filteredTags.map(tag => (
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