import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import PrivateRouter from './guard/PrivateRouter.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import TelegramCallback from './pages/TelegramCallback.jsx';
import UserProfile from './pages/Profile.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRouter>
        <App />
      </PrivateRouter>
    ),
    children: [
      {
        path: "/",
        element: <UserProfile />,
      },
    ],
    errorElement: <div>Page not found!</div>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  { path: '/telegram/callback', element: <TelegramCallback /> },
  {
    path: "*", // Catch-all route for 404
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</h2>
          <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
          <a href="/" className="btn btn-primary">
            <i className="fas fa-home mr-2"></i>
            Back to Home
          </a>
        </div>
      </div>
    ),
  }
], {
  basename: "/" // Production uchun basename
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      } persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>
)

// REDUX GLOBAL STATE 
// REDUX STATE => LOCALSTORAGE