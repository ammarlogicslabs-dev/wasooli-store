import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAdminAuth } from "../admin/auth/AdminAuthContext";
import { useAuth } from "../auth/AuthContext";
import { useSmoothNavigate } from "../auth/useSmoothNavigate";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";

const STORE_NAME = "Wasooli Store";

const PERKS = [
  { icon: Truck, text: "Fast delivery on your orders" },
  { icon: RotateCcw, text: "Easy and hassle-free returns" },
  { icon: ShieldCheck, text: "Secure and protected shopping" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ identifier, password }) {
  const errors = {};
  const value = identifier.trim();

  if (!value) {
    errors.identifier = "Enter your username or Email address.";
  } else if (value.includes("@") && !EMAIL_PATTERN.test(value)) {
    errors.identifier = "Enter a valid email address.";
  } else if (!value.includes("@") && value.length < 3) {
    errors.identifier = "Username must be at least 3 characters.";
  }

  if (!password) {
    errors.password = "Enter your password.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { login: adminLogin, isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useSmoothNavigate();
  const location = useLocation();
  const fromLocation = location.state?.from;
  const redirectPath = fromLocation?.pathname || (typeof fromLocation === "string" ? fromLocation : "");
  const from = redirectPath || "/shop";
  const fromState = fromLocation && typeof fromLocation === "object" ? fromLocation.state : undefined;
  const wantsAdmin = Boolean(redirectPath && redirectPath.startsWith("/admin"));
  const loginTimer = useRef(null);

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    document.title = `Login | ${STORE_NAME}`;
  }, []);

  useEffect(() => {
    if (!redirectPath) return;
    if (wantsAdmin) {
      if (isAdminAuthenticated) navigate(from, { replace: true });
      return;
    }
    if (isAuthenticated) {
      navigate(from, { replace: true, state: fromState });
    }
  }, [isAuthenticated, isAdminAuthenticated, from, fromState, navigate, redirectPath, wantsAdmin]);

  useEffect(() => {
    return () => {
      if (loginTimer.current) {
        window.clearTimeout(loginTimer.current);
      }
    };
  }, []);

  const errors = validate(form);

  function handleChange(event) {
    const { name, value } = event.target;
    setAuthError("");
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ identifier: true, password: true });

    if (Object.keys(errors).length > 0 || loading) return;

    setLoading(true);
    setAuthError("");

    // Route by API role: try customer login first; Admin role hands off to admin session.
    let result = await login(form.identifier, form.password);
    let signingInAsAdmin = false;

    if (!result.success && result.role === "Admin") {
      result = await adminLogin(form.identifier, form.password);
      signingInAsAdmin = Boolean(result.success);
    }

    setLoading(false);

    if (result.success) {
      toast.success("Logged in successfully");
      const nextPath = signingInAsAdmin
        ? (wantsAdmin ? from : "/admin")
        : (wantsAdmin ? "/shop" : from);
      navigate(nextPath, { replace: true, state: signingInAsAdmin ? undefined : fromState });
    } else {
      setAuthError(result.message || "Invalid username, email, or password.");
    }
  }

  const showError = (name) => touched[name] && errors[name];

  const inputClass = (name) =>
    `w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${showError(name)
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
    }`;

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-brand-600 via-brand-500 to-brand-700 lg:flex lg:flex-col lg:justify-start lg:gap-18 xl:gap-20 lg:p-12 xl:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative inline-flex items-center gap-3">
          <span className="grid size-16 place-items-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md ring-2 ring-brand-100">
            <img
              src="/wasooli.png"
              alt="Wasooli Store"
              className="h-full w-full object-cover"
            />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            {STORE_NAME}
          </span>
        </div>

        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
            Welcome back
          </p>
          <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-white xl:text-3xl">
            Shop smarter with {STORE_NAME}
            <span className="text-white/60">.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
            Sign in to track your orders, save your favorites and check out
            faster.
          </p>

          <ul className="mt-10 space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon size={19} />
                </span>
                <span className="text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>


      <section className="flex min-h-screen items-start justify-center px-4 pt-8 pb-10 sm:px-6 sm:pt-28 lg:min-h-0 lg:items-center lg:pt-10">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-7 flex flex-col items-center lg:hidden">
            <Link className="flex flex-col items-center gap-3">
              <span className="grid size-20 place-items-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md ring-2 ring-brand-100">
                <img
                  src="/wasooli.png"
                  alt="Wasooli Store"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-xl font-bold tracking-tight text-brand-700">
                {STORE_NAME}
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 sm:text-xs">
              Sign In To Your Account
            </p>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Welcome back<span className="text-brand-500">.</span>
            </h1>

            <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Sign in with your username or email to continue shopping.
            </p>

            {authError && (
              <div
                role="alert"
                className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 sm:text-sm"
              >
                <AlertCircle size={16} className="shrink-0" />
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              {/* Username / email */}
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-1.5 block text-xs font-semibold text-slate-900 sm:text-sm"
                >
                  Username or Email
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    value={form.identifier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your username or email"
                    aria-invalid={Boolean(showError("identifier"))}
                    aria-describedby={
                      showError("identifier") ? "identifier-error" : undefined
                    }
                    className={inputClass("identifier")}
                  />
                </div>
                {showError("identifier") && (
                  <p
                    id="identifier-error"
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600"
                  >
                    <AlertCircle size={14} />
                    {errors.identifier}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-900 sm:text-sm"
                  >
                    Password
                  </label>

                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                    aria-invalid={Boolean(showError("password"))}
                    aria-describedby={
                      showError("password") ? "password-error" : undefined
                    }
                    className={`${inputClass("password")} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-brand-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </Link> */}
                {showError("password") && (
                  <p
                    id="password-error"
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600"
                  >
                    <AlertCircle size={14} />
                    {errors.password}
                  </p>
                )}
              </div>



              <button
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>



          </div>
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-200 pt-5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Powered by
            </span>
            <img
              src="/logicslabs-logo.png"
              alt="Logics Labs"
              className="h-5 w-auto object-contain "
            />
          </div>

        </div>
      </section>
    </main>
  );
}