import './App.css';
import { useState } from 'react';
import FileUpload from './components/FileUpload'
import DownloadSection from './components/DownloadSection';
import ReviewListPage from './components/ReviewListPage';

function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [fileData, setFileData] = useState(null);

  const handleFileUploadSuccess = (data) => {
    setFileData(data);
    setCurrentView('list');
  }

  return (
    <div className="App">
      {currentView === 'upload' && (
        <FileUpload onSuccess={handleFileUploadSuccess}/>
      )}

      {currentView === 'list' && fileData && (
        <main>
          <DownloadSection
            fileId={fileData.file_id}
            fileName="processed_reviews.csv"
        />
          <ReviewListPage data={fileData}/>
        </main>
      )}
    </div>
  );
}

export default App;
