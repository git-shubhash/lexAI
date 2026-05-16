import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './store/AppContext';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import UploadCenter from './pages/UploadCenter';
import Analysis from './pages/Analysis';
import AIChat from './pages/AIChat';
import Comparison from './pages/Comparison';
import History from './pages/History';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="upload" element={<UploadCenter />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="chat" element={<AIChat />} />
              <Route path="compare" element={<Comparison />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
