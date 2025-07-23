import './App.css';

import { useSignals } from '@preact/signals-react/runtime';
import { BrowserRouter as Router, Navigate,Route, Routes } from 'react-router-dom';

import { Header } from './components/Layout/Header';
import { ShowDetail } from './components/ShowDetail';
import { ShowList } from './components/ShowList';
import { ShowListInfinite } from './components/ShowListInfinite';
import { isInfiniteScroll, restoreScrollPosition,saveScrollPosition, selectedShow, toggleViewMode } from './store/signals';
import { type Show } from './types/movie';

function App() {
  useSignals();

  const handleShowClick = (show: Show) => {
    saveScrollPosition();
    selectedShow.value = show;
    
    window.scrollTo({ top: 0 });
  };

  const handleBackToList = () => {
    selectedShow.value = null;
    
    restoreScrollPosition();
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 antialiased">
        <Routes>
          <Route
            path="/"
            element={
              selectedShow.value ? (
                <ShowDetail
                  show={selectedShow.value}
                  onBack={handleBackToList}
                />
              ) : (
                <div>
                  <Header onToggleMode={toggleViewMode} />
                  {isInfiniteScroll.value ? (
                    <ShowListInfinite onShowClick={handleShowClick} />
                  ) : (
                    <ShowList onShowClick={handleShowClick} />
                  )}
                </div>
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
