import React, { useState } from 'react';
import { SettingsPage } from './presentation/pages/SettingsPage';
import { TaskListPage } from './presentation/pages/TaskListPage';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'tasks' | 'settings'>('tasks');

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl text-blue-600">Local PM</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentPage('tasks')}
                  className={`${
                    currentPage === 'tasks'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setCurrentPage('settings')}
                  className={`${
                    currentPage === 'settings'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        {currentPage === 'tasks' && <TaskListPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

export default App;
