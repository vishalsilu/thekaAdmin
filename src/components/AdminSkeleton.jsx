import React from 'react';

const AdminSkeleton = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* --- Sidebar Skeleton (Hidden on mobile) --- */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 animate-pulse">
        {/* Logo Area */}
        <div className="h-16 border-b border-gray-100 flex items-center px-6">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
        {/* Nav Links */}
        <div className="p-4 space-y-6 mt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col w-full">
        
        {/* Header Skeleton */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 animate-pulse">
          {/* Breadcrumb / Title */}
          <div className="h-5 w-32 sm:w-48 bg-gray-200 rounded"></div>
          
          {/* Profile / Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
        </header>

        {/* Dashboard Content Skeleton */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Top Stats Row (4 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse flex flex-col justify-between h-32">
                <div className="flex justify-between items-center mb-4">
                   <div className="h-4 w-20 bg-gray-200 rounded"></div>
                   <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
              </div>
            ))}
          </div>

          {/* Main Data Table / Chart Area */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse min-h-[400px]">
            {/* Table Header */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div className="h-6 w-40 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
            
            {/* Table Rows */}
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4 hidden sm:block"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminSkeleton;