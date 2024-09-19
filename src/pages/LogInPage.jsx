import "../assets/css/LogIn.css";
import "../assets/css/Styles.css";
import { useNavigate } from "react-router-dom";

export default function LogInPage() {
  const navigate = useNavigate();

  return (
    <div className="login-info">
      <div className="login-card">
        <h2>Log In</h2>
        <form className="login-form">
          <div className="google-login">
            <button type="button" className="btn btn-light">
              Continue with Google
            </button>
          </div>
          <label htmlFor="email" className="form-label">
            Email address
            <input type="text" name="email" className="form-control" />
          </label>
          <label htmlFor="email" className="form-label">
            Password
            <input type="text" name="email" className="form-control" />
          </label>
          <label className="remember-check">
            <button type="checkbox" className="form-check-input"></button>
            Remember Me
          </label>
          <button type="button" className="btn btn-light">
            Log In
          </button>
        </form>
        <div className="sign-up">
          <h5>Don't have an account?</h5>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
