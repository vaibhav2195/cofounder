import React, { useState, useEffect } from 'react';
import { Search, Calendar, User as UserIcon, Star, Lock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { StartupIdea, User, Application } from '../types';

type IdeaWithFounder = StartupIdea & {
  users: User | null;
};

export default function IdeaList() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<IdeaWithFounder[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithFounder | null>(null);
  const [applicationNote, setApplicationNote] = useState('');

  useEffect(() => {
    fetchIdeas();
    if (user?.user_type === 'developer') {
      fetchUserApplications();
    }
  }, [user]);

  const fetchUserApplications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('developer_id', user.id);
      
      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('startup_ideas')
        .select(`
          *,
          users:founder_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);

      // Extract unique skills
      const skills = new Set<string>();
      data?.forEach(idea => {
        idea.required_skills.forEach(skill => skills.add(skill));
      });
      setAllSkills(Array.from(skills));
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (ideaId: string) => {
    if (!user) {
      alert('Please login to apply');
      return;
    }
    if (user.user_type !== 'developer') {
      alert('Only developers can apply to ideas');
      return;
    }

    // Check if user has already applied
    const existingApplication = applications.find(app => app.idea_id === ideaId);
    if (existingApplication) {
      alert('You have already applied to this idea');
      return;
    }

    try {
      const { error } = await supabase
        .from('applications')
        .insert([{ 
          idea_id: ideaId, 
          developer_id: user.id,
          note: applicationNote 
        }]);

      if (error) throw error;
      alert('Application submitted successfully!');
      setSelectedIdea(null);
      setApplicationNote('');
      // Refresh applications list
      fetchUserApplications();
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to submit application');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const hasApplied = (ideaId: string) => {
    return applications.some(app => app.idea_id === ideaId);
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 ||
                         selectedSkills.some(skill => idea.required_skills.includes(skill));
    return matchesSearch && matchesSkills;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {allSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkills(prev =>
                prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
              )}
              className={`px-3 py-1 rounded-full text-sm font-medium
                ${selectedSkills.includes(skill)
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800'}`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{idea.title}</h3>
                {idea.has_nda && (
                  <Lock className="h-5 w-5 text-purple-600" />
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <UserIcon className="h-4 w-4 mr-1" />
                <span>{idea.users?.full_name || 'Anonymous'}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(idea.created_at)}</span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{idea.description}</p>
              
              <div className="mb-4 flex flex-wrap gap-2">
                {idea.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600">
                    {idea.compensation_type === 'both' 
                      ? `${idea.equity_percentage}% + $${idea.monetary_compensation}/mo`
                      : idea.compensation_type === 'equity'
                      ? `${idea.equity_percentage}% equity`
                      : `$${idea.monetary_compensation}/mo`}
                  </span>
                </div>
                {user?.user_type === 'developer' && (
                  <button
                    onClick={() => setSelectedIdea(idea)}
                    disabled={hasApplied(idea.id)}
                    className={`px-4 py-2 rounded-md text-sm ${
                      hasApplied(idea.id)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {hasApplied(idea.id) ? 'Applied' : 'View Details'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedIdea.title}</h2>
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <p className="mt-2 text-gray-600">{selectedIdea.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Required Skills</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedIdea.required_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Compensation</h3>
                  <div className="mt-2 space-y-2">
                    {selectedIdea.compensation_type === 'equity' && (
                      <p className="text-gray-600">Equity: {selectedIdea.equity_percentage}%</p>
                    )}
                    {selectedIdea.compensation_type === 'monetary' && (
                      <p className="text-gray-600">Monthly: ${selectedIdea.monetary_compensation}</p>
                    )}
                    {selectedIdea.compensation_type === 'both' && (
                      <>
                        <p className="text-gray-600">Equity: {selectedIdea.equity_percentage}%</p>
                        <p className="text-gray-600">Monthly: ${selectedIdea.monetary_compensation}</p>
                      </>
                    )}
                  </div>
                </div>

                {selectedIdea.terms_and_conditions && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Terms and Conditions</h3>
                    <p className="mt-2 text-gray-600">{selectedIdea.terms_and_conditions}</p>
                  </div>
                )}

                {user?.user_type === 'developer' && !hasApplied(selectedIdea.id) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Your Application</h3>
                    <textarea
                      value={applicationNote}
                      onChange={(e) => setApplicationNote(e.target.value)}
                      placeholder="Tell the founder why you're interested and what makes you a great fit..."
                      className="mt-2 w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleApply(selectedIdea.id)}
                      className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Submit Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && filteredIdeas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No ideas found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}