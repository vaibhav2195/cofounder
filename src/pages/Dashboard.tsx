import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Users, Briefcase, ChevronRight, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { StartupIdea } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    required_skills: '',
    compensation_type: 'equity',
    equity_percentage: '',
    monetary_compensation: '',
    terms_and_conditions: '',
    has_nda: false
  });

  useEffect(() => {
    if (user?.user_type === 'founder') {
      fetchFounderIdeas();
    }
  }, [user]);

  const fetchFounderIdeas = async () => {
    const { data, error } = await supabase
      .from('startup_ideas')
      .select('*')
      .eq('founder_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ideas:', error);
    } else {
      setIdeas(data);
    }
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ideaData = {
      founder_id: user?.id,
      title: newIdea.title,
      description: newIdea.description,
      required_skills: newIdea.required_skills.split(',').map(skill => skill.trim()),
      compensation_type: newIdea.compensation_type,
      equity_percentage: newIdea.equity_percentage ? parseFloat(newIdea.equity_percentage) : null,
      monetary_compensation: newIdea.monetary_compensation ? parseFloat(newIdea.monetary_compensation) : null,
      terms_and_conditions: newIdea.terms_and_conditions,
      has_nda: newIdea.has_nda
    };

    const { error } = await supabase
      .from('startup_ideas')
      .insert([ideaData]);

    if (error) {
      console.error('Error creating idea:', error);
    } else {
      setShowNewIdeaModal(false);
      fetchFounderIdeas();
      setNewIdea({
        title: '',
        description: '',
        required_skills: '',
        compensation_type: 'equity',
        equity_percentage: '',
        monetary_compensation: '',
        terms_and_conditions: '',
        has_nda: false
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your {user?.user_type === 'founder' ? 'startup ideas' : 'applications'}
          </p>
        </div>
        {user?.user_type === 'founder' && (
          <button
            onClick={() => setShowNewIdeaModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post New Idea
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Ideas</dt>
                  <dd className="text-lg font-medium text-gray-900">{ideas.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Discussions</dt>
                  <dd className="text-lg font-medium text-gray-900">4</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">3</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ideas List */}
      {user?.user_type === 'founder' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Your Ideas</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {ideas.map((idea) => (
              <li key={idea.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-indigo-600 truncate">{idea.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{idea.description}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${idea.has_nda ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {idea.has_nda ? 'NDA Required' : 'Public'}
                      </span>
                      <ChevronRight className="ml-4 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {idea.required_skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* New Idea Modal */}
      {showNewIdeaModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Post New Startup Idea</h3>
            <form onSubmit={handleSubmitIdea}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={newIdea.title}
                    onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    value={newIdea.description}
                    onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={newIdea.required_skills}
                    onChange={(e) => setNewIdea({...newIdea, required_skills: e.target.value})}
                    placeholder="React, Node.js, Python"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Compensation Type</label>
                  <select
                    value={newIdea.compensation_type}
                    onChange={(e) => setNewIdea({...newIdea, compensation_type: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="equity">Equity Only</option>
                    <option value="monetary">Monetary Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {(newIdea.compensation_type === 'equity' || newIdea.compensation_type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Equity Percentage</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newIdea.equity_percentage}
                      onChange={(e) => setNewIdea({...newIdea, equity_percentage: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {(newIdea.compensation_type === 'monetary' || newIdea.compensation_type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Compensation ($)</label>
                    <input
                      type="number"
                      required
                      value={newIdea.monetary_compensation}
                      onChange={(e) => setNewIdea({...newIdea, monetary_compensation: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Terms and Conditions</label>
                  <textarea
                    value={newIdea.terms_and_conditions}
                    onChange={(e) => setNewIdea({...newIdea, terms_and_conditions: e.target.value})}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_nda"
                    checked={newIdea.has_nda}
                    onChange={(e) => setNewIdea({...newIdea, has_nda: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="has_nda" className="ml-2 block text-sm text-gray-700">
                    Require NDA
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewIdeaModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}