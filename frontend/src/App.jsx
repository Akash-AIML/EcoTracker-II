import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { UserProvider } from './hooks/useUser';

// Lazy-load page components for code splitting — reduces initial bundle size
const HomePage = lazy(() => import('./pages/HomePage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SimulatorPage = lazy(() => import('./pages/SimulatorPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Minimal loading fallback shown while lazy chunks are being fetched */
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" aria-label="Loading page">
      <div className="w-8 h-8 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="calculator" element={<CalculatorPage />} />
              <Route path="dashboard/:assessmentId" element={<DashboardPage />} />
              <Route path="simulator/:assessmentId" element={<SimulatorPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserProvider>
  );
}
