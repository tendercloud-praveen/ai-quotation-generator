import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import Button from "../../components/Button";
import { Input } from "../../components/Field";
import { useToast } from "../../components/Toast";

import {
  forgotPasswordApi,
  resetPasswordApi,
} from "../../services/authService";

import { validateEmail, validateStrongPassword } from "../../lib/validate";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordTimer = useRef(null);
  const confirmPasswordTimer = useRef(null);

  const togglePasswordVisibility = () => {
    if (showPassword) {
      // Hide immediately
      setShowPassword(false);

      if (passwordTimer.current) {
        clearTimeout(passwordTimer.current);
      }

      return;
    }

    // Show password
    setShowPassword(true);

    // Automatically hide after 3 seconds
    passwordTimer.current = setTimeout(() => {
      setShowPassword(false);
    }, 3000);
  };

  const toggleConfirmPasswordVisibility = () => {
    if (showConfirmPassword) {
      // Hide immediately
      setShowConfirmPassword(false);

      if (confirmPasswordTimer.current) {
        clearTimeout(confirmPasswordTimer.current);
      }

      return;
    }

    // Show confirm password
    setShowConfirmPassword(true);

    // Automatically hide after 3 seconds
    confirmPasswordTimer.current = setTimeout(() => {
      setShowConfirmPassword(false);
    }, 3000);
  };

  const set = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  };

  // STEP 1 - REQUEST OTP
  const requestReset = async (event) => {
    event.preventDefault();

    const validationErrors = {};

    if (!form.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      validationErrors.email = "Enter a valid email";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPasswordApi(form.email.trim());

      console.log("FORGOT PASSWORD RESPONSE:", response);

      toast.success(
        response?.message || "OTP sent successfully. Check your email.",
      );

      // Move to OTP/password screen
      setStep(2);
    } catch (error) {
      console.error("Forgot password error:", error);

      const detail = error.response?.data?.detail;

      let message = "Failed to send OTP.";

      if (Array.isArray(detail)) {
        message = detail[0]?.msg || message;
      } else {
        message =
          detail || error.response?.data?.message || error.message || message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 - RESET PASSWORD
  const doReset = async (event) => {
    event.preventDefault();

    const validationErrors = {};

    if (!form.otp.trim()) {
      validationErrors.otp = "OTP is required";
    }

    if (!form.password) {
      validationErrors.password = "Password is required";
    } else if (!validateStrongPassword(form.password)) {
      validationErrors.password =
        "Use 8+ chars with upper, lower, number & symbol";
    }

    if (!form.confirm) {
      validationErrors.confirm = "Please confirm your password";
    } else if (form.confirm !== form.password) {
      validationErrors.confirm = "Passwords do not match";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await resetPasswordApi({
        email: form.email.trim(),
        otp: form.otp.trim(),
        new_password: form.password,
        confirm_password: form.confirm,
      });

      console.log("RESET PASSWORD RESPONSE:", response);

      toast.success(response?.message || "Password reset successfully.");

      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Reset password error:", error);

      const detail = error.response?.data?.detail;

      let message = "Failed to reset password.";

      if (Array.isArray(detail)) {
        message = detail[0]?.msg || message;
      } else {
        message =
          detail || error.response?.data?.message || error.message || message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Reset your password
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {step === 1 && "Enter your email and we'll send you an OTP."}

          {step === 2 &&
            "Enter the OTP sent to your email and choose a new password."}
        </p>
      </div>

      {/* =====================================================
          STEP 1
      ===================================================== */}

      {step === 1 && (
        <form onSubmit={requestReset} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={errors.email}
            required
          />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send OTP
          </Button>
        </form>
      )}

      {/* =====================================================
          STEP 2
      ===================================================== */}

      {step === 2 && (
        <form onSubmit={doReset} className="space-y-4">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-2.5 text-sm text-blue-700 dark:text-blue-300">
            An OTP has been sent to{" "}
            <span className="font-semibold">{form.email}</span>
          </div>

          <Input
            label="OTP"
            icon={KeyRound}
            placeholder="Enter OTP"
            value={form.otp}
            onChange={(e) => set("otp", e.target.value)}
            error={errors.otp}
            required
          />

          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              icon={KeyRound}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              error={errors.password}
              required
            />

            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              icon={KeyRound}
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              error={errors.confirm}
              required
            />

            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Reset Password
          </Button>
        </form>
      )}
    </div>
  );
}
