import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import TagFilter from './TagFilter';
import RecordList from './RecordList';

const Home = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const { logout } = useContext(AuthContext);

  const handleTagSelect = (tag) => {
    setSelectedTags([...selectedTags, tag]);
  };

  const handleTagRemove = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Knowledge Base Search</h1>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>
      
      <TagFilter
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
        onTagRemove={handleTagRemove}
        onClearAll={handleClearAllTags}
      />
      
      <RecordList selectedTags={selectedTags} />
    </div>
  );
};

export default Home;