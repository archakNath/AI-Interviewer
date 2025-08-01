import React from "react";
import {
  Camera,
  Upload,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Star,
  Users,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router";

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 absolute w-full top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">InterviewAI</span>
        </div>

        {localStorage.getItem("token") ? (
          <button
            className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        ) : (
          <button
            className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login / Sign Up
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 pt-16 pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white text-sm mb-8">
            <Star className="w-4 h-4 mr-2 text-yellow-400" />
            Trusted by 10,000+ job seekers
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Your Next
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Interview
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Upload your resume and practice with an AI interviewer that analyzes
            your responses, provides real-time feedback, and helps you land your
            dream job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1">
              Start Interview Practice
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl text-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-400">Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-400">Interviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides personalized interview practice
              tailored to your resume and target role.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Resume
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Simply upload your resume and our AI analyzes your skills,
                experience, and projects to create personalized questions.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Video Interview
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Practice with realistic video interviews. Answer questions using
                your webcam and microphone for authentic experience.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Get Feedback
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Receive detailed feedback on content accuracy, communication
                clarity, confidence, and specific improvement suggestions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Why Choose InterviewAI?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Personalized Questions
                    </h3>
                    <p className="text-gray-600">
                      Questions tailored to your resume, skills, and target
                      industry for relevant practice.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Real-time Evaluation
                    </h3>
                    <p className="text-gray-600">
                      Instant feedback on your answers, body language, and
                      communication style.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Cost-Effective
                    </h3>
                    <p className="text-gray-600">
                      Save thousands compared to hiring professional interview
                      coaches.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      24/7 Availability
                    </h3>
                    <p className="text-gray-600">
                      Practice anytime, anywhere. No scheduling conflicts or
                      time constraints.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">10,000+</div>
                      <div className="text-blue-100">Happy Users</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-blue-100">Success Rate</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">50K+</div>
                      <div className="text-blue-100">Practice Sessions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of successful job seekers who've improved their
            interview skills with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl">
              Start Free Practice
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl text-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300">
              View Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">InterviewAI</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 InterviewAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
