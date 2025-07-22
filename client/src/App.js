import React, { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import Login from './components/Login';
import Home from './components/Home';

function App() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return isAuthenticated ? <Home /> : <Login />;
}

export default App;