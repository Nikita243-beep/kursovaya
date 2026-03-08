import { createBrowserRouter, RouterProvider, NavLink, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import { FamilyProvider } from './context/FamilyContext';
import { TasksProvider } from './context/TasksContext';

function Layout() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Домашняя панель
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Задачи
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Календарь
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Профиль
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Настройки
          </NavLink>
        </div>
      </nav>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: (
      <FamilyProvider>
        <TasksProvider>
          <Layout />
        </TasksProvider>
      </FamilyProvider>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'tasks', element: <Dashboard /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
