// import { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
// import Button from '../../components/Button';
// import { Input } from '../../components/Field';
// import { useToast } from '../../components/Toast';
// import { login } from '../../lib/auth';
// import { validateEmail } from '../../lib/validate';
// import { ROLE_HOME } from '../../lib/nav';

// export default function LoginPage() {
//   const toast = useToast();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [errors, setErrors] = useState({});
//   const [show, setShow] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

//   const submit = (ev) => {
//     ev.preventDefault();
//     const e = {};
//     if (!form.email.trim()) e.email = 'Email is required';
//     else if (!validateEmail(form.email)) e.email = 'Enter a valid email';
//     if (!form.password) e.password = 'Password is required';
//     setErrors(e);
//     if (Object.keys(e).length) return;
//     setLoading(true);
//     setTimeout(() => {
//       const res = login(form.email, form.password);
//       setLoading(false);
//       if (!res.ok) { toast.error(res.error); return; }
//       toast.success(`Welcome back, ${res.user.fullName.split(' ')[0]}!`);
//       const from = location.state?.from;
//       navigate(from || ROLE_HOME[res.user.role] || '/app/dashboard');
//     }, 500);
//   };

//   return (
//     <div className="animate-slide-up">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back</h2>
//         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your QuotaAI workspace.</p>
//       </div>

//       <form onSubmit={submit} className="space-y-4">
//         <Input label="Email Address" type="email" icon={Mail} placeholder="you@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
//         <div>
//           <Input
//             label="Password" type={show ? 'text' : 'password'} icon={Lock} placeholder="••••••••" value={form.password}
//             onChange={(e) => set('password', e.target.value)} error={errors.password} required
//             rightSlot={<button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
//           />
//           <div className="mt-1.5 text-right">
//             <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Forgot password?</Link>
//           </div>
//         </div>
//         <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
//       </form>

//       <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
//         <Sparkles size={14} className="text-brand-500" /> New here? <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Create your company account</Link>
//       </div>

//       <button
//         type="button"
//         onClick={() => {
//           if (confirm('Clear all demo data and start fresh? This removes all users, sessions, and sample data from this browser.')) {
//             Object.keys(localStorage).filter((k) => k.startsWith('quotaai:')).forEach((k) => localStorage.removeItem(k));
//             toast.info('Demo data cleared. You can now create a new company account.');
//             navigate('/signup');
//           }
//         }}
//         className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
//       >
//         Reset demo data & start fresh
//       </button>
//     </div>
//   );
// }

// import { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
// import Button from "../../components/Button";
// import { Input } from "../../components/Field";
// import { useToast } from "../../components/Toast";
// import { validateEmail } from "../../lib/validate";
// import Cookies from "js-cookie";
// import { loginUser } from "../../services/documentservice";

// export default function LoginPage() {
//   const toast = useToast();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({});
//   const [show, setShow] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const set = (k, v) => {
//     setForm((f) => ({ ...f, [k]: v }));
//     setErrors((e) => ({ ...e, [k]: undefined }));
//   };

//   const submit = async (ev) => {
//     ev.preventDefault();

//     const e = {};

//     if (!form.email.trim()) {
//       e.email = "Email is required";
//     } else if (!validateEmail(form.email)) {
//       e.email = "Enter a valid email";
//     }

//     if (!form.password) {
//       e.password = "Password is required";
//     }

//     setErrors(e);

//     if (Object.keys(e).length) return;

//     setLoading(true);

//     try {
//       const res = await loginUser({
//         email: form.email,
//         password: form.password,
//       });

//       Cookies.set("access_token", res.access_token, {
//         expires: 7,
//         sameSite: "Lax",
//         secure: false, // true in production HTTPS
//       });

//       Cookies.set(
//         "user",
//         JSON.stringify({
//           id: res.id,
//           full_name: res.full_name,
//           email: res.email,
//           role: res.role,
//           company_id: res.company_id,
//         }),
//         {
//           expires: 7,
//           sameSite: "Lax",
//           secure: false,
//         },
//       );

//       toast.success(res.message);

//       navigate("/app/dashboard");
//     } catch (error) {
//       toast.error(
//         error.response?.data?.detail ||
//           error.response?.data?.message ||
//           "Invalid Email or Password",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="animate-slide-up">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
//           Welcome back
//         </h2>
//         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//           Sign in to your QuotaAI workspace.
//         </p>
//       </div>

//       <form onSubmit={submit} className="space-y-4">
//         <Input
//           label="Email Address"
//           type="email"
//           icon={Mail}
//           placeholder="you@company.com"
//           value={form.email}
//           onChange={(e) => set("email", e.target.value)}
//           error={errors.email}
//           required
//         />
//         <div>
//           <Input
//             label="Password"
//             type={show ? "text" : "password"}
//             icon={Lock}
//             placeholder="••••••••"
//             value={form.password}
//             onChange={(e) => set("password", e.target.value)}
//             error={errors.password}
//             required
//             rightSlot={
//               <button
//                 type="button"
//                 onClick={() => setShow(!show)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//               >
//                 {show ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             }
//           />
//           <div className="mt-1.5 text-right">
//             <Link
//               to="/forgot-password"
//               className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
//             >
//               Forgot password?
//             </Link>
//           </div>
//         </div>
//         <Button type="submit" loading={loading} className="w-full" size="lg">
//           Sign In
//         </Button>
//       </form>

//       <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
//         <Sparkles size={14} className="text-brand-500" /> New here?{" "}
//         <Link
//           to="/signup"
//           className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
//         >
//           Create your company account
//         </Link>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

import Button from "../../components/Button";
import { Input } from "../../components/Field";
import { useToast } from "../../components/Toast";

import { validateEmail } from "../../lib/validate";
import { loginUser } from "../../services/documentservice";
import { setSession } from "../../lib/auth";
import { useRole } from "../../lib/RoleContext";
export default function LoginPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const { setUser } = useRole();
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FORM SETTER
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  // const submit = async (event) => {
  //   event.preventDefault();

  //   const validationErrors = {};

  //   /*
  //   |--------------------------------------------------------------------------
  //   | EMAIL VALIDATION
  //   |--------------------------------------------------------------------------
  //   */

  //   if (!form.email.trim()) {
  //     validationErrors.email = "Email is required";
  //   } else if (!validateEmail(form.email)) {
  //     validationErrors.email = "Enter a valid email address";
  //   }

  //   /*
  //   |--------------------------------------------------------------------------
  //   | PASSWORD VALIDATION
  //   |--------------------------------------------------------------------------
  //   */

  //   if (!form.password) {
  //     validationErrors.password = "Password is required";
  //   }

  //   setErrors(validationErrors);

  //   if (Object.keys(validationErrors).length > 0) {
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     /*
  //     |--------------------------------------------------------------------------
  //     | SEND DATABASE CREDENTIALS TO BACKEND
  //     |--------------------------------------------------------------------------
  //     |
  //     | Backend checks:
  //     |
  //     | email
  //     | password
  //     |
  //     | If valid:
  //     |     200 OK
  //     |     Set-Cookie: access_token=...; HttpOnly
  //     |
  //     | Frontend NEVER reads the token.
  //     |
  //     */

  //     const response = await loginUser({
  //       email: form.email.trim(),
  //       password: form.password,
  //     });

  //     console.log("LOGIN SUCCESS:", response);

  //     /*
  //     |--------------------------------------------------------------------------
  //     | DO NOT USE js-cookie
  //     |--------------------------------------------------------------------------
  //     |
  //     | Backend has already created:
  //     |
  //     | access_token = HttpOnly cookie
  //     |
  //     | Browser stores it automatically.
  //     |
  //     */

  //     toast.success(response?.message || "Login successful");

  //     /*
  //     |--------------------------------------------------------------------------
  //     | GO TO DASHBOARD
  //     |--------------------------------------------------------------------------
  //     */

  //     navigate("/app/dashboard", {
  //       replace: true,
  //     });
  //   } catch (error) {
  //     console.error("LOGIN ERROR:", error);

  //     const detail = error?.response?.data?.detail;

  //     const message = error?.response?.data?.message;

  //     if (Array.isArray(detail)) {
  //       toast.error(detail[0]?.msg || "Invalid email or password");
  //     } else {
  //       toast.error(detail || message || "Invalid email or password");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const submit = async (event) => {
    event.preventDefault();

    const validationErrors = {};

    if (!form.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      validationErrors.email = "Enter a valid email";
    }

    if (!form.password) {
      validationErrors.password = "Password is required";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      console.log("LOGIN RESPONSE:", response);

      // Make sure backend returned authentication data
      if (!response?.access_token) {
        throw new Error("Login succeeded but access token was not returned.");
      }

      // Create frontend session
      const loggedInUser = {
        id: response.id,
        fullName: response.full_name,
        email: response.email,
        role: response.role?.toLowerCase(),
        companyId: response.company_id,
      };

      // Save cookies
      setSession(response.access_token, loggedInUser);

      // IMPORTANT:
      // Update React RoleContext immediately.
      // This removes the need to refresh the browser.
      setUser(loggedInUser);

      toast.success(response?.message || "Login successful");

      navigate("/app/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      const detail = error?.response?.data?.detail;

      let message = "Invalid Email or Password";

      if (Array.isArray(detail)) {
        message = detail[0]?.msg || message;
      } else if (detail) {
        message = detail;
      } else if (error.message) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Welcome back
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign in to your QuotaAI workspace.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* EMAIL */}

        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="you@company.com"
          value={form.email}
          onChange={(event) => set("email", event.target.value)}
          error={errors.email}
          required
        />

        {/* PASSWORD */}

        <div>
          <Input
            label="Password"
            type={show ? "text" : "password"}
            icon={Lock}
            placeholder="••••••••"
            value={form.password}
            onChange={(event) => set("password", event.target.value)}
            error={errors.password}
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShow((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <div className="mt-1.5 text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* LOGIN BUTTON */}

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* SIGNUP */}

      <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
        <Sparkles size={14} className="text-brand-500" />

        <span>New here? </span>

        <Link
          to="/signup"
          className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Create your company account
        </Link>
      </div>
    </div>
  );
}
