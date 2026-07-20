import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Alert from "../components/Alert";
import { validateSignupForm } from "../lib/validation";
import { emailExists, registerCompanyAdmin } from "../lib/users";

export default function Signup() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    companyName: "",
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setServerError("");
    if (success) setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    const fieldErrors = validateSignupForm(values);
    // Surface duplicate email as a server-style error.
    if (!fieldErrors.email && emailExists(values.email)) {
      fieldErrors.email = "An account with this email already exists.";
    }
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      registerCompanyAdmin(values);
      setSuccess("Account created successfully. Redirecting to login…");
      setValues({
        companyName: "",
        fullName: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Start your 14-day free trial. No credit card required."
      altLink={
        <span>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Sign in
          </Link>
        </span>
      }
    >
      {success && <Alert type="success" message={success} duration={0} />}
      {serverError && <Alert type="error" message={serverError} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="companyName" className="label-text">
            Company name
          </label>
          <input
            id="companyName"
            type="text"
            autoComplete="organization"
            className={`input-field ${errors.companyName ? "input-error" : ""}`}
            placeholder="Acme Industries"
            value={values.companyName}
            onChange={(e) => update("companyName", e.target.value)}
          />
          {errors.companyName && (
            <p className="error-text">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label htmlFor="fullName" className="label-text">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className={`input-field ${errors.fullName ? "input-error" : ""}`}
            placeholder="Jordan Carter"
            value={values.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          {errors.fullName && <p className="error-text">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="label-text">
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? "input-error" : ""}`}
            placeholder="jordan@acme.com"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="mobile" className="label-text">
            Mobile number
          </label>
          <input
            id="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className={`input-field ${errors.mobile ? "input-error" : ""}`}
            placeholder="9876543210"
            value={values.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            maxLength={10}
          />
          {errors.mobile && <p className="error-text">{errors.mobile}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label-text">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={`input-field pr-11 ${errors.password ? "input-error" : ""}`}
              placeholder="Create a strong password"
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
          {errors.password ? (
            <p className="error-text">{errors.password}</p>
          ) : (
            <p className="mt-1.5 text-xs text-ink-400 dark:text-ink-500">
              8+ characters with uppercase, lowercase, number, and special character.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label-text">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={`input-field ${errors.confirmPassword ? "input-error" : ""}`}
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 text-base"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating account…
            </>
          ) : (
            "Create workspace"
          )}
        </button>

        <p className="text-center text-xs leading-relaxed text-ink-400 dark:text-ink-500">
          By creating an account, you agree to Quota's{" "}
          <span className="font-medium text-ink-500 dark:text-ink-400">Terms of Service</span> and{" "}
          <span className="font-medium text-ink-500 dark:text-ink-400">Privacy Policy</span>.
        </p>
      </form>
    </AuthLayout>
  );
}
