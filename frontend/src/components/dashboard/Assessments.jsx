import React, { useEffect, useState } from 'react';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      const userId = localStorage.getItem('token'); // Assuming userId is stored directly
      if (!userId) {
        console.error('No userId found in localStorage.');
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/assessments/user/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch assessments');
        const data = await res.json();
        setAssessments(data.assessments || []);
      } catch (err) {
        console.error('Error fetching assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading assessments...</div>;
  }

  if (assessments.length === 0) {
    return <div className="text-center mt-10 text-gray-600">No assessments found.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Assessments</h2>
      <div className="grid gap-6">
        {assessments.map((a) => (
          <div key={a._id} className="bg-white shadow-md rounded-xl p-5 border border-gray-200">
            <div className="mb-3 text-sm text-gray-500">
              <span className="font-medium text-gray-600">Created:</span>{' '}
              {new Date(a.createdAt).toLocaleString()}
            </div>

            <div className="mb-3">
              <p className="text-gray-800 text-sm">
                <span className="font-semibold">Resume Snippet:</span>{' '}
                {a.resumeContent.slice(0, 120)}...
              </p>
            </div>

            <div className="mb-3 text-gray-700">
              <span className="font-semibold">Questions Answered:</span> {a.qa.length}
            </div>

            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Assessment Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <strong>Score:</strong> {a.assessmentDetails?.score ?? 'N/A'}
                </div>
                <div>
                  <strong>Clarity:</strong> {a.assessmentDetails?.clarity || 'N/A'}
                </div>
                <div>
                  <strong>Technical:</strong> {a.assessmentDetails?.technical || 'N/A'}
                </div>
                <div>
                  <strong>Completeness:</strong> {a.assessmentDetails?.completeness || 'N/A'}
                </div>
                <div>
                  <strong>Professionalism:</strong> {a.assessmentDetails?.professionalism || 'N/A'}
                </div>
              </div>
            </div>

            {a.assessmentDetails?.suggestions && (
              <div className="mt-4">
                <h5 className="font-semibold text-gray-800 mb-1">Suggestions:</h5>
                <p className="text-gray-700 text-sm whitespace-pre-line">
                  {a.assessmentDetails.suggestions}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;
