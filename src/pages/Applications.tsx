import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, X, MessageSquare, Phone, ExternalLink, User as UserIcon, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Application, StartupIdea, User } from '../types';

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<(Application & {
    startup_ideas: StartupIdea;
    users: User | null;
  })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeveloper, setSelectedDeveloper] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          startup_ideas (*),
          users:developer_id(*)
        `)
        .eq(user?.user_type === 'founder' ? 'startup_ideas.founder_id' : 'developer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (developerId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', developerId)
        .single();

      if (error) throw error;
      setSelectedDeveloper(data);
    } catch (error) {
      console.error('Error fetching developer details:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: action })
        .eq('id', applicationId);

      if (error) throw error;
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">
        {user?.user_type === 'founder' ? 'Developer Applications' : 'Your Applications'}
      </h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {applications.map((application) => (
            <li key={application.id}>
              <div className="px-6 py-6 flex flex-col sm:flex-row justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-indigo-600">
                      {application.startup_ideas.title}
                    </h3>
                    <span className={`ml-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      getStatusBadgeClass(application.status)
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  
                  {user?.user_type === 'founder' && application.users && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Applicant:</span> {application.users.full_name}
                        </p>
                        <button
                          onClick={() => handleViewDetails(application.users.id)}
                          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          <UserIcon className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </div>
                      {application.users.expertise && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Expertise:</span> {application.users.expertise}
                        </p>
                      )}
                      {application.note && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Note:</span>
                          </p>
                          <p className="mt-1 text-sm text-gray-800 bg-gray-50 p-3 rounded-md">
                            {application.note}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {user?.user_type === 'founder' && application.status === 'pending' && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleApplicationAction(application.id, 'approved')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApplicationAction(application.id, 'rejected')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}

                  {application.status === 'approved' && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Contact Information:</span>
                      </p>
                      {user?.user_type === 'founder' && application.users?.whatsapp_number && (
                        <a
                          href={`https://wa.me/${application.users.whatsapp_number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          WhatsApp
                        </a>
                      )}
                      <button className="ml-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No applications found.</p>
          </div>
        )}
      </div>

      {/* Developer Details Modal */}
      {selectedDeveloper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedDeveloper.full_name}</h2>
              <button
                onClick={() => setSelectedDeveloper(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {selectedDeveloper.expertise && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Expertise</h3>
                  <p className="mt-2 text-gray-600">{selectedDeveloper.expertise}</p>
                </div>
              )}

              {selectedDeveloper.background && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Background</h3>
                  <p className="mt-2 text-gray-600">{selectedDeveloper.background}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{selectedDeveloper.email}</span>
                  </div>

                  {selectedDeveloper.whatsapp_number && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <a
                        href={`https://wa.me/${selectedDeveloper.whatsapp_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {selectedDeveloper.whatsapp_number}
                      </a>
                    </div>
                  )}

                  {selectedDeveloper.github_username && (
                    <div className="flex items-center">
                      <Github className="h-5 w-5 text-gray-400 mr-2" />
                      <a
                        href={`https://github.com/${selectedDeveloper.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        @{selectedDeveloper.github_username}
                      </a>
                    </div>
                  )}

                  {selectedDeveloper.linkedin_url && (
                    <div className="flex items-center">
                      <Linkedin className="h-5 w-5 text-gray-400 mr-2" />
                      <a
                        href={selectedDeveloper.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}