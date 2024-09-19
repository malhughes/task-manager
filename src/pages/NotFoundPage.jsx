import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <>
      <h1>404 Error Not Found</h1>
      <Link to="/">Home</Link>
    </>
  );
}
