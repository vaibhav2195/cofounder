import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Github, Linkedin, Mail, Briefcase, Book } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        {/* Profile Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center space-x-5">
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  className="h-16 w-16 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || '')}&background=random`}
                  alt=""
                />
                <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
              <p className="text-sm font-medium text-gray-500">
                {user?.user_type === 'founder' ? 'Startup Founder' : 'Developer'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>

            {user?.github_username && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Github className="h-5 w-5 mr-2" />
                  GitHub
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a
                    href={`https://github.com/${user.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    @{user.github_username}
                  </a>
                </dd>
              </div>
            )}

            {user?.linkedin_url && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Linkedin className="h-5 w-5 mr-2" />
                  LinkedIn
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a
                    href={user.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    View Profile
                  </a>
                </dd>
              </div>
            )}

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Expertise
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.expertise || 'Not specified'}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Book className="h-5 w-5 mr-2" />
                Background
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.background || 'Not specified'}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <button className="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}