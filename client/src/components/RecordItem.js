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

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const parseMarkdownLink = (text) => {
    // 匹配markdown链接格式 [文本](链接)
    const markdownLinkRegex = /^\[([^\]]+)\]\(([^\)]+)\)$/;
    const match = text.match(markdownLinkRegex);
    
    if (match) {
      return {
        isMarkdownLink: true,
        text: match[1],
        url: match[2]
      };
    }
    
    return {
      isMarkdownLink: false,
      text: text,
      url: text
    };
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
          {resources.map((resource, index) => {
            const parsed = parseMarkdownLink(resource);
            const isClickable = parsed.isMarkdownLink || isValidUrl(parsed.url);
            
            return isClickable ? (
              <a 
                key={index} 
                href={parsed.url} 
                className="record-resource"
                target="_blank"
                rel="noopener noreferrer"
              >
                {parsed.text}
              </a>
            ) : (
              <span 
                key={index} 
                className="record-resource record-resource-text"
              >
                {parsed.text}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecordItem;