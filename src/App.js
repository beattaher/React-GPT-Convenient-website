import './App.css';
import { unstable_HistoryRouter as HistoryRouter, BrowserRouter, Route, Routes } from 'react-router-dom';
import { history } from '@/utils';
import Layout from '@/pages/Layout';
import Login from "@/pages/Login";
import { Button, Checkbox, Form, Input } from 'antd';
import { AuthComponent } from '@/components/AuthComponent';
import { lazy, Suspense } from 'react';
import './i18n'
const Legal = lazy(() => import('@/pages/Legal'));
const NoteHelper = lazy(() => import('@/pages/NoteHelper'));
const Home = lazy(() => import('@/pages/Home'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {
  return (
    <HistoryRouter history={history}>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={
            <AuthComponent>
              <Layout />
            </AuthComponent>
          }>
            <Route index element={<Home />} />
            <Route path="noteHelper" element={<NoteHelper />} />
            <Route path="legal" element={<Legal />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} /> //--- 将这一行移到这里
        </Routes>
      </Suspense>
    </HistoryRouter>
  );
}

export default App;
