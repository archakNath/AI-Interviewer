import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Interview = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [duration, setDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [showResumeContent, setShowResumeContent] = useState(false);
  const [selectedResumeContent, setSelectedResumeContent] = useState(null);

  const navigate = useNavigate();
  const userId = localStorage.getItem("token");

  // Fetch user's resumes
  const fetchResumes = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/resumes/${userId}`);
      const data = await res.json();

      if (res.ok) {
        setResumes(data.resumes || []);
      } else {
        setError(data.error || "Failed to fetch resumes");
      }
    } catch (err) {
      setError("Error fetching resumes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [userId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("userId", userId);

      const res = await fetch("http://localhost:3000/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";

        await fetchResumes();
        alert("Resume uploaded successfully!");
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewResume = async (resumeId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/api/resumes/${userId}/${resumeId}`
      );
      const data = await res.json();

      if (res.ok) {
        setSelectedResumeContent(data);
        setShowResumeContent(true);
      } else {
        setError("Failed to fetch resume content");
      }
    } catch (err) {
      setError("Error fetching resume: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = (e) => {
    e.preventDefault();
    if (!selectedResume) {
      setError("Please select a resume");
      return;
    }

    // Send data as query parameters
    navigate(
      `/interview?resumeId=${encodeURIComponent(
        selectedResume
      )}&duration=${encodeURIComponent(duration)}`
    );
  };

  if (!userId) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Please log in to start an interview.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Start Your Interview
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError("")}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-6 text-black">
        {/* Upload Resume Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="submit"
              disabled={loading || !file}
              className={`px-4 py-2 rounded text-white ${
                loading || !file
                  ? "bg-gray-400"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Uploading..." : "Upload Resume"}
            </button>
          </form>
        </div>

        {/* Interview Setup Form */}
        <form onSubmit={handleStartInterview}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Resume
            </label>
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
            ) : resumes.length === 0 ? (
              <div className="text-gray-600 bg-gray-50 p-4 rounded">
                No resumes available. Please upload a resume first.
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume.filename}
                    </option>
                  ))}
                </select>
                {selectedResume && (
                  <button
                    type="button"
                    onClick={() => handleReviewResume(selectedResume)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Review Selected Resume
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Interview Duration (minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="w-16 text-center font-medium">
                {duration} min
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || !selectedResume}
              className={`
                w-full sm:w-auto px-6 py-3 rounded-lg text-white font-medium
                ${
                  loading || !selectedResume
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transform transition-transform duration-200 hover:scale-105"
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Preparing...
                </span>
              ) : (
                "Start Interview"
              )}
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Tips:</p>
          <ul className="mt-2 text-left list-disc list-inside">
            <li>Ensure you're in a quiet environment</li>
            <li>Test your microphone before starting</li>
            <li>Have a notepad ready for taking notes</li>
            <li>Review your selected resume beforehand</li>
          </ul>
        </div>
      </div>

      {/* Resume Content Modal */}
      {showResumeContent && selectedResumeContent && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] text-black flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedResumeContent.filename}
              </h3>
              <button
                onClick={() => setShowResumeContent(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
              <pre className="whitespace-pre-wrap font-sans">
                {selectedResumeContent.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
