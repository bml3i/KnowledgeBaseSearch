import React from 'react';

const RecordItem = ({ record }) => {
  const {
    summary,
    echo_token,
    content,
    resources,
    tags,
    created_at,
    is_active
  } = record;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(echo_token)
      .then(() => {
        alert('Echo token copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy token:', err);
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="record">
      <div className="record-header">
        <div className="record-summary">{summary}</div>
        <span 
          className="record-token" 
          onClick={handleCopyToken}
          title="Click to copy"
        >
          {echo_token}
        </span>
      </div>
      
      <div className="record-meta">
        <div>Created: {formatDate(created_at)}</div>
        <div className={is_active ? 'status-active' : 'status-inactive'}>
          {is_active ? 'Active' : 'Inactive'}
        </div>
      </div>
      
      <div className="record-tags">
        {tags.map(tag => (
          <span key={tag} className="record-tag">{tag}</span>
        ))}
      </div>
      
      <div className="record-content">{content}</div>
      
      {resources && resources.length > 0 && (
        <div className="record-resources">
          <strong>Resources:</strong>
          {resources.map((resource, index) => (
            <a 
              key={index} 
              href={resource} 
              className="record-resource"
              target="_blank"
              rel="noopener noreferrer"
            >
              {resource}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordItem;