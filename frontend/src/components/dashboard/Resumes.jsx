import React, { useEffect, useState } from "react";

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [editingResume, setEditingResume] = useState(null);
  const [editFilename, setEditFilename] = useState("");

  const userId = localStorage.getItem("token");

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/resumes/${userId}`);
      const data = await res.json();

      if (res.ok) {
        // Backend returns { resumes: [...], count: number }
        setResumes(data.resumes || []);
        setError("");
      } else {
        setError(data.error || "Failed to fetch resumes");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

        fetchResumes();
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

  const handleViewResume = async (resumeId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/api/resumes/${userId}/${resumeId}`
      );
      const data = await res.json();

      if (res.ok) {
        setSelectedResume(data);
      } else {
        setError(data.error || "Failed to fetch resume content");
      }
    } catch (err) {
      setError("Error fetching resume: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResume = (resume) => {
    setEditingResume(resume);
    setEditFilename(resume.filename);
  };

  const handleUpdateResume = async (e) => {
    e.preventDefault();
    if (!editFilename.trim()) {
      setError("Filename cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:3000/api/resumes/${userId}/${editingResume._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: editFilename.trim(),
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setEditingResume(null);
        setEditFilename("");
        fetchResumes();
        alert("Resume updated successfully!");
      } else {
        setError(data.error || "Update failed");
      }
    } catch (err) {
      setError("Update error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/api/resumes/${userId}/${resumeId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (res.ok) {
        fetchResumes();
        setSelectedResume(null);
        alert("Resume deleted successfully!");
      } else {
        setError(data.error || "Failed to delete resume");
      }
    } catch (err) {
      setError("Delete error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedResume(null);
  };

  const closeEditModal = () => {
    setEditingResume(null);
    setEditFilename("");
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchResumes();
    }
  }, [userId]);

  if (!userId) {
    return (
      <div className="p-6 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Please log in to view your resumes.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Resume</h2>

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

      <form onSubmit={handleUpload} className="mb-6">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={loading}
        />
        <p className="text-sm text-gray-600 mb-2">
          Supported formats: PDF, DOCX
        </p>
        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${
            loading || !file
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={loading || !file}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">
        Your Resumes ({resumes.length}):
      </h3>

      {loading && !selectedResume && !editingResume && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {resumes.length === 0 && !loading ? (
        <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
          No resumes uploaded yet. Upload your first resume above!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <h4
                className="font-semibold text-lg mb-2 truncate"
                title={resume.filename}
              >
                {resume.filename}
              </h4>
              <p className="text-gray-600 text-sm mb-3">
                Uploaded: {formatDate(resume.createdAt)}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleViewResume(resume._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  disabled={loading}
                >
                  View
                </button>
                <button
                  onClick={() => handleEditResume(resume)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteResume(resume._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing resume content */}
      {selectedResume && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
          <div className="bg-white text-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {selectedResume.filename}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {selectedResume.content}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Content length: {selectedResume.content?.length || 0} characters
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing resume details */}
      {editingResume && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
          <div className="bg-white text-black rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Resume Details</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateResume} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filename
                </label>
                <input
                  type="text"
                  value={editFilename}
                  onChange={(e) => setEditFilename(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new filename"
                  maxLength={255}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editFilename.length}/255 characters
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${
                    loading || !editFilename.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={loading || !editFilename.trim()}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resumes;