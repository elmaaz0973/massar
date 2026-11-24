import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Background from './components/Background.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Stage from './pages/Stage.jsx';
const Lesson = lazy(() => import('./pages/Lesson.jsx'));
import NotFound from './pages/NotFound.jsx';
import Auth from './pages/Auth.jsx';
import Me from './pages/Me.jsx';
import Tools from './pages/Tools.jsx';
import Tool from './pages/Tool.jsx';
const AdminHome = lazy(() => import('./pages/admin/AdminHome.jsx'));
const AdminEditor = lazy(() => import('./pages/admin/AdminEditor.jsx'));

export default function App() {
  const { pathname } = useLocation();
  const bare = pathname === '/' || pathname === '/tools'; // الرئيسية والأدوات: كروت مباشرة فوق الخلفية
  const wide = /^\/stages\/[^/]+\/lessons\//.test(pathname); // صفحة الدرس: عمود فهرس + محتوى + إعلان
  return (
    <>
      <Background showRobot={pathname !== '/' && !wide} />
      <Navbar />
      <main className={`container ${bare ? 'bare' : 'panel'}${wide ? ' wide' : ''}`}>
        <Suspense fallback={<p className="state">جارٍ التحميل…</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stages/:stageSlug" element={<Stage />} />
          <Route path="/stages/:stageSlug/lessons/:lessonSlug" element={<Lesson />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/me" element={<Me />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:toolSlug" element={<Tool />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/lessons/:id" element={<AdminEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
