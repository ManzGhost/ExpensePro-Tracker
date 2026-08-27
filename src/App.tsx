/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AddExpensePage } from './pages/AddExpensePage';
import { EditExpensePage } from './pages/EditExpensePage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-gray-300 selection:bg-indigo-600 selection:text-white">
            {/* Top Sticky Navigation */}
            <Navbar />

            {/* Main Application Page Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <Routes>
                {/* Public Authentication Routes */}
                <Route path="/login" element={<LoginPage initialMode="login" />} />
                <Route path="/register" element={<LoginPage initialMode="register" />} />

                {/* Protected Application Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <ExpensesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add"
                  element={
                    <ProtectedRoute>
                      <AddExpensePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit/:id"
                  element={
                    <ProtectedRoute>
                      <EditExpensePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Clean App Footer */}
            <footer className="border-t border-[#1f1f1f] bg-[#0d0d0d] py-6 text-center text-xs text-gray-500 mt-12">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="font-medium text-gray-400">
                  ExpenseFlow — Modern Expense Tracker & Budget Analytics
                </p>
                <p className="text-gray-500">
                  Secure Auth • Obsidian Theme • LocalStorage Sync
                </p>
              </div>
            </footer>

            {/* Global Toast Notifications */}
            <ToastContainer />
          </div>
        </BrowserRouter>
      </ExpenseProvider>
    </AuthProvider>
  );
}
