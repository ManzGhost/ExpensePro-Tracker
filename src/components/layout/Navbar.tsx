import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart3,
  Sliders,
  Wallet,
  Menu,
  X,
  LogOut,
  User,
  UserX,
} from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { calculateTotals, formatCurrency } from '../../utils/formatters';
import { BudgetSettingsModal } from './BudgetSettingsModal';
import { DeleteAccountModal } from '../auth/DeleteAccountModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { expenses, budgetConfig, addToast } = useExpenses();
  const { user, isAuthenticated, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const totals = calculateTotals(expenses);
  const monthPercent = Math.min(
    100,
    Math.round((totals.totalThisMonth / (budgetConfig.monthlyBudget || 1)) * 100)
  );

  const handleLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Signed Out',
      description: 'You have been safely signed out of your session.',
    });
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/add', label: 'Add Expense', icon: PlusCircle },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1f1f1f] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                id="brand-logo-link"
                className="flex items-center gap-2.5 group focus:outline-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30 group-hover:scale-105 transition-transform">
                  <Wallet size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                    ExpenseFlow
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-600/15 text-indigo-400 border border-indigo-600/30">
                      PRO
                    </span>
                  </span>
                  <span className="text-[11px] text-gray-500 block -mt-1 font-medium">
                    Personal Expense Hub
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links (Authenticated only) */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#222]">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-xs'
                          : 'text-gray-400 hover:text-white hover:bg-[#1f1f1f]'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Side Stats & Actions */}
            <div className="flex items-center gap-2.5">
              {isAuthenticated ? (
                <>
                  {/* Month Budget Status Pill */}
                  <button
                    type="button"
                    id="navbar-budget-pill"
                    onClick={() => setIsSettingsOpen(true)}
                    title="Click to configure budget"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#222] hover:border-indigo-500/50 hover:bg-[#161616] bg-[#141414] transition-all text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none">
                        This Month
                      </span>
                      <span className="text-xs font-bold text-white font-mono leading-tight">
                        {formatCurrency(totals.totalThisMonth, budgetConfig.currencySymbol, budgetConfig.currencyCode)}
                      </span>
                    </div>
                    <div className="w-12 h-2 rounded-full bg-[#222] overflow-hidden ml-1">
                      <div
                        className={`h-full rounded-full transition-all ${
                          monthPercent > 90
                            ? 'bg-rose-500'
                            : monthPercent > 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${monthPercent}%` }}
                      />
                    </div>
                  </button>

                  {/* Quick Settings Button */}
                  <button
                    type="button"
                    id="open-settings-btn"
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1f1f1f] border border-[#222] transition-colors"
                    title="Budget & Preferences"
                    aria-label="Open settings"
                  >
                    <Sliders size={18} />
                  </button>

                  {/* User Profile Pill */}
                  <button
                    type="button"
                    id="navbar-user-profile"
                    onClick={() => setIsSettingsOpen(true)}
                    className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-[#222] transition-colors cursor-pointer"
                    title={`Logged in as ${user?.email || 'User'} - Click to manage settings`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {user?.name?.charAt(0) || <User size={12} />}
                    </div>
                    <span className="text-xs font-medium text-gray-300 max-w-[100px] truncate">
                      {user?.name || 'Account'}
                    </span>
                  </button>

                  {/* Logout Button */}
                  <button
                    type="button"
                    id="navbar-logout-btn"
                    onClick={handleLogout}
                    title="Log out of session"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>

                  {/* Mobile Hamburger */}
                  <button
                    type="button"
                    id="mobile-menu-toggle-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-xl text-gray-400 hover:bg-[#1a1a1a] border border-[#222]"
                    aria-label="Toggle Navigation Menu"
                  >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    id="navbar-login-link-btn"
                    className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-all ${
                      location.pathname === '/login'
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/40 shadow-xs'
                        : 'text-gray-300 hover:text-white hover:bg-[#1f1f1f] border border-[#262626]'
                    }`}
                  >
                    <User size={14} />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    id="navbar-register-link-btn"
                    className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl font-bold text-xs transition-all ${
                      location.pathname === '/register'
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    <span>Create Account</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-[#1f1f1f] bg-[#0d0d0d] px-4 pt-3 pb-5 space-y-2 shadow-lg">
            {/* User Details Header in Mobile */}
            <div className="px-4 py-2 bg-[#141414] border border-[#222] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user?.name?.charAt(0) || <User size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#1f1f1f] space-y-2">
              <button
                type="button"
                id="mobile-budget-settings-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-[#1a1a1a]"
              >
                <span className="flex items-center gap-2">
                  <Sliders size={18} className="text-gray-400" />
                  Budget & Settings
                </span>
                <span className="font-mono text-xs font-bold text-gray-400">
                  {formatCurrency(budgetConfig.monthlyBudget, budgetConfig.currencySymbol, budgetConfig.currencyCode)} limit
                </span>
              </button>

              <button
                type="button"
                id="mobile-logout-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
              >
                <LogOut size={18} />
                Logout ({user?.email})
              </button>

              <button
                type="button"
                id="mobile-delete-account-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDeleteAccountOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-500/20 transition-colors"
              >
                <UserX size={15} />
                Permanently Delete Account
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Settings Modal */}
      <BudgetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
      />
    </>
  );
};
