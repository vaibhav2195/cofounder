import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Github, Linkedin, Code, BookOpen, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export default function DeveloperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [developer, setDeveloper] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchDeveloperDetails();
  }, [id]);

  const fetchDeveloperDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDeveloper(data);
    } catch (error) {
      console.error('Error fetching developer details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!developer) {
    return <div className="text-center py-12">Developer not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-6">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(developer.full_name)}&size=128&background=random`}
              alt={developer.full_name}
              className="h-32 w-32 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{developer.full_name}</h1>
              <p className="text-gray-500">{developer.expertise || 'Software Developer'}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6">
            {developer.background && (
              <div>
                <h2 className="flex items-center text-lg font-medium text-gray-900 mb-2">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Background
                </h2>
                <p className="text-gray-600">{developer.background}</p>
              </div>
            )}

            {developer.expertise && (
              <div>
                <h2 className="flex items-center text-lg font-medium text-gray-900 mb-2">
                  <Code className="h-5 w-5 mr-2" />
                  Expertise
                </h2>
                <p className="text-gray-600">{developer.expertise}</p>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{developer.email}</span>
                </div>

                {developer.whatsapp_number && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <a
                      href={`https://wa.me/${developer.whatsapp_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {developer.whatsapp_number}
                    </a>
                  </div>
                )}

                {developer.github_username && (
                  <div className="flex items-center">
                    <Github className="h-5 w-5 text-gray-400 mr-2" />
                    <a
                      href={`https://github.com/${developer.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      @{developer.github_username}
                    </a>
                  </div>
                )}

                {developer.linkedin_url && (
                  <div className="flex items-center">
                    <Linkedin className="h-5 w-5 text-gray-400 mr-2" />
                    <a
                      href={developer.linkedin_url}
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
    </div>
  );
}