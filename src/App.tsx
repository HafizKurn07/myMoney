import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { BudgetPage } from './pages/BudgetPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AssetsPage } from './pages/AssetsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddTransactionPage } from './pages/AddTransactionPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/transaksi" element={<TransactionsPage />} />
            <Route path="/aset" element={<AssetsPage />} />
            <Route path="/pengaturan" element={<SettingsPage />} />
          </Route>
          {/* Fullscreen form route without bottom nav */}
          <Route path="/transaksi/tambah" element={<AddTransactionPage />} />
          <Route path="/transaksi/ubah/:id" element={<AddTransactionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
