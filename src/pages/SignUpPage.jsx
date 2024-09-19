import "../assets/css/SignUp.css";
import "../assets/css/Styles.css";

export default function SignUpPage() {
  return (
    <div className="signup-info">
      <div className="signup-card">
        <h2>Sign Up</h2>
        <form className="signup-form">
          <label htmlFor="name" className="form-label">
            Name
            <input type="text" name="name" className="form-control" />
          </label>
          <label htmlFor="email" className="form-label">
            Email address
            <input type="text" name="email" className="form-control" />
          </label>
          <label htmlFor="email" className="form-label">
            Password
            <input type="text" name="email" className="form-control" />
          </label>
          <button type="button" className="btn btn-light">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
