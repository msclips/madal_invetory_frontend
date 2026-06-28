import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import OpeningStock from './pages/OpeningStock';
import ItemInwards from './pages/ItemInwards';
import ItemOutwards from './pages/ItemOutwards';
import { setupInterceptors } from './services/api';
import { getItem, deleteDB } from './utils/db';
import { TranslateProvider } from './config/translate/translateContext';

setupInterceptors(
  async () => await getItem('accessToken'),
  async () => {
    await deleteDB();
    window.location.href = '/login';
  }
);

function App() {
  return (
    <TranslateProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="items" element={<Items />} />
            <Route path="opening-stock" element={<OpeningStock />} />
            <Route path="item-inwards" element={<ItemInwards />} />
            <Route path="item-outwards" element={<ItemOutwards />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TranslateProvider>
  );
}

export default App;