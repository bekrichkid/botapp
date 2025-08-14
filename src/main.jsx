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
const router = createBrowserRouter([
  {
    path: "/",
    element: (<App />),
    children: [
      {
        path: "/",
        element: <div>Home</div>,
      }
    ]
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  }
]);


createRoot(document.getElementById('root')).render(

  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
)
