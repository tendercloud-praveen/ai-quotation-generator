import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Alert from "../components/Alert";
import { validateLoginForm } from "../lib/validation";
import { useAuth } from "../context/AuthContext";
import { getRoleHome } from "../lib/navigation";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    if (serverError) setServerError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const fieldErrors = validateLoginForm(values);
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    setSubmitting(true);
    // Defer to next tick so the spinner can paint.
    setTimeout(() => {
      const session = login(values.email, values.password);
      setSubmitting(false);
      if (!session) {
        setServerError("Invalid email or password.");
        return;
      }
      // Redirect to the authenticated user's own role dashboard.
      // Never reuse a previous session or default to a fixed role's route.
      const roleHome = getRoleHome(session.role);
      navigate(roleHome, { replace: true });
    }, 250);
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Quota workspace."
      altLink={
        <span>
          New to Quota?{" "}
          <Link
            to="/signup"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Create an account
          </Link>
        </span>
      }
    >
      {serverError && <Alert type="error" message={serverError} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="email" className="label-text">
              Email
            </label>
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? "input-error" : ""}`}
            placeholder="you@company.com"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label-text">
              Password
            </label>
            <button
              type="button"
              className="mb-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={`input-field pr-11 ${errors.password ? "input-error" : ""}`}
              placeholder="Enter your password"
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 dark:text-ink-500 dark:hover:bg-ink-800 dark:hover:text-ink-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3.3 2.3a1 1 0 011.4 1.4l-1.6 1.6A8 8 0 002 10c.7 3.7 3.7 7 8 7 1.6 0 3-.4 4.2-1.1l1.6 1.6a1 1 0 001.4-1.4l-14-14zM10 6a4 4 0 014 4c0 .5-.1 1-.3 1.4l-5.1-5.1A4 4 0 0110 6z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3c-4.3 0-7.3 3.3-8 7 .7 3.7 3.7 7 8 7s7.3-3.3 8-7c-.7-3.7-3.7-7-8-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 text-base"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
