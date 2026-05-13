import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SitePage from './pages/SitePage';
import AdminLogin from './pages/AdminLogin';
import AdminPortal from './pages/AdminPortal';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/site/:slug" element={<SitePage />} />
        <Route path="/site/:slug/admin" element={<AdminPortal />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
