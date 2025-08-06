import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

export default function Layout() {
  return (
    <ErrorBoundary>
      <Header />
      <Outlet />
    </ErrorBoundary>
  );
}