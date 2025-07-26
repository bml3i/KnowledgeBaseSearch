import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import RecordItem from './RecordItem';
import Pagination from './Pagination';

const RecordList = ({ selectedTags, keyword }) => {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { getAuthHeaders } = useContext(AuthContext);

  useEffect(() => {
    fetchRecords(1);
  }, [selectedTags, keyword]);

  const fetchRecords = async (page) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = { page };
      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',');
      }
      if (keyword && keyword.trim()) {
        params.keyword = keyword.trim();
      }
      
      const response = await axios.get('/api/records', {
        ...getAuthHeaders(),
        params
      });
      
      setRecords(response.data.records);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching records:', error);
      setError('Failed to load records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchRecords(page);
  };

  if (isLoading && records.length === 0) {
    return <div>Loading records...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (records.length === 0) {
    return (
      <div className="records-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          No records found. Try selecting different tags.
        </div>
      </div>
    );
  }

  return (
    <div className="records-container">
      {/* <h3>Knowledge Base Records</h3> */}
      
      {records.map(record => (
        <RecordItem key={record.id} record={record} />
      ))}
      
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default RecordList;