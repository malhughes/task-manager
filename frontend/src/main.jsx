import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'react-dnd-multi-backend';

import { AuthProvider } from "./contexts/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LogInPage from "./pages/LogInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

import NotFoundPage from "./pages/NotFoundPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <LogInPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

// Configure multi-backend for both mouse and touch support
const backendOptions = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: {
        enableMouseEvents: true,
        delayTouchStart: 200, // Add delay to distinguish between tap and drag
        delayMouseStart: 0,
        touchSlop: 16, // Minimum distance to start drag
      },
      preview: true,
      transition: {
        type: 'touchstart',
        options: { delay: 200 }
      }
    }
  ]
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DndProvider backend={MultiBackend} options={backendOptions}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </DndProvider>
  </StrictMode>
);
