import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, Wallet, Building2, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { hospital } from '../data/seedData'
import logo from '../assets/logo.png'
import logoFull from '../assets/logo-full.png'

const homeByRole = {
  superadmin: '/super-admin',
  billing: '/billing',
  patient: '/patient',
}

export default function Login() {
  const { login, signupPatient } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = login(loginForm.email, loginForm.password)
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      navigate(homeByRole[result.user.role])
    }, 350)
  }

  const handleSignup = (e) => {
    e.preventDefault()
    setError('')
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (signupForm.password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    if (signupForm.password !== signupForm.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const result = signupPatient(signupForm)
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      navigate('/patient')
    }, 350)
  }

  const fillDemo = (email, password) => {
    setMode('login')
    setLoginForm({ email, password })
    setError('')
  }

  return (
    <div className="min-h-screen w-full flex bg-ink-50">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-700 text-white flex-col justify-between p-12">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-16 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <img src={logoFull} alt={hospital.name} className="h-16 max-w-full object-contain bg-white rounded-xl px-4 py-2.5 shadow-sm" />
          <p className="text-xs text-white/70 mt-2">{hospital.system}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 bg-white/10 rounded-full px-3 py-1 mb-5">
            <Sparkles size={13} /> One connected patient-credit journey
          </p>
          <h1 className="text-3xl xl:text-4xl font-semibold leading-tight mb-4">
            Hospital billing, patient loyalty and oversight — in one workflow.
          </h1>
          <p className="text-white/75 max-w-md text-sm leading-relaxed">{hospital.tagline}</p>

          <div className="grid grid-cols-3 gap-3 mt-10 max-w-md">
            <FeaturePill icon={Building2} label="Super Admin" desc="Configure & govern" />
            <FeaturePill icon={ShieldCheck} label="Billing Admin" desc="Bill & issue credits" />
            <FeaturePill icon={Wallet} label="Patient" desc="Track & redeem" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative text-xs text-white/50"
        >
          © {new Date().getFullYear()} {hospital.name}. All rights reserved.
        </motion.p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 min-w-0">
            <img src={logo} alt="" className="h-9 w-9 shrink-0" />
            <span className="font-semibold text-ink-900 truncate">{hospital.name}</span>
          </div>

          <div className="flex items-center gap-1 bg-ink-100 rounded-xl p-1 mb-7">
            <TabButton active={mode === 'login'} onClick={() => { setMode('login'); setError('') }}>
              Log in
            </TabButton>
            <TabButton active={mode === 'signup'} onClick={() => { setMode('signup'); setError('') }}>
              Patient sign up
            </TabButton>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-semibold text-ink-900">Welcome back</h2>
                  <p className="text-sm text-ink-500 mt-1">Sign in to your HMS workspace.</p>
                </div>

                <Field label="Email address">
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="input"
                  />
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </Field>

                {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Signing in…' : 'Sign in'}
                  {!loading && <ArrowRight size={16} />}
                </button>

                <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-3.5 text-xs text-ink-500 space-y-1.5">
                  <p className="font-medium text-ink-600">Demo accounts</p>
                  <DemoRow label="Super Admin" email="super_admin@gmail.com" onClick={fillDemo} />
                  <DemoRow label="Billing Admin" email="billing_admin@gmail.com" onClick={fillDemo} />
                  <DemoRow label="Patient" email="anitha.reddy@example.com" password="patient123" onClick={fillDemo} />
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-semibold text-ink-900">Create your patient account</h2>
                  <p className="text-sm text-ink-500 mt-1">
                    Register to track purchases, credits and redemptions.
                  </p>
                </div>

                <Field label="Full name">
                  <input
                    required
                    value={signupForm.name}
                    onChange={(e) => setSignupForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    className="input"
                  />
                </Field>
                <Field label="Email address">
                  <input
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="input"
                  />
                </Field>
                <Field label="Phone number">
                  <input
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 90000 00000"
                    className="input"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Password">
                    <input
                      type="password"
                      required
                      value={signupForm.password}
                      onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="input"
                    />
                  </Field>
                  <Field label="Confirm password">
                    <input
                      type="password"
                      required
                      value={signupForm.confirm}
                      onChange={(e) => setSignupForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="••••••••"
                      className="input"
                    />
                  </Field>
                </div>

                {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Creating account…' : 'Create account'}
                  {!loading && <ArrowRight size={16} />}
                </button>
                <p className="text-xs text-ink-400 text-center">
                  Only patients can self-register. Admin access is provisioned by the hospital.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function FeaturePill({ icon: Icon, label, desc }) {
  return (
    <div className="rounded-xl bg-white/10 border border-white/15 p-3 backdrop-blur-sm">
      <Icon size={16} className="mb-2 text-white/90" />
      <p className="text-xs font-semibold">{label}</p>
      <p className="text-[11px] text-white/60 mt-0.5">{desc}</p>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
        active ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
      }`}
    >
      {children}
    </button>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function DemoRow({ label, email, password = '123456', onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(email, password)}
      className="flex items-center justify-between w-full rounded-lg px-2 py-1.5 hover:bg-white transition-colors text-left"
    >
      <span>
        <span className="font-medium text-ink-600">{label}:</span> {email}
      </span>
      <span className="text-brand-600 font-medium">Use</span>
    </button>
  )
}
