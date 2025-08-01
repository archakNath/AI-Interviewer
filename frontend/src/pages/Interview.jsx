import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const Interview = () => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  const [finalizedTranscript, setFinalizedTranscript] = useState("");

  // Mock location and navigation for demonstration
  const duration = 10; // Mock duration in minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const userVideoRef = useRef(null);
  const isStartingRef = useRef(false);
  const questionTimerRef = useRef(null);
  const overallTimerRef = useRef(null);
  const location = useLocation();

  // Mock questions for demonstration
  const mockQuestions = [
    { question: "Tell me about yourself and your background.", time: 60 },
    { question: "What are your greatest strengths?", time: 45 },
    { question: "Where do you see yourself in 5 years?", time: 50 },
    { question: "Why do you want to work for our company?", time: 55 },
    { question: "Do you have any questions for us?", time: 30 },
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setSpeechSupported(true);
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        isStartingRef.current = false;
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
        isStartingRef.current = false;
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        isStartingRef.current = false;
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        let detectedSpeech = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript.trim() + " ";
            detectedSpeech = true;
          } else {
            interimTranscript += result[0].transcript.trim() + " ";
          }
        }

        if (finalTranscript) {
          setCurrentAnswer((prev) => prev + finalTranscript);
          setTranscript(finalTranscript + interimTranscript);
        } else if (interimTranscript) {
          setTranscript(interimTranscript);
        }

        setIsSpeaking(detectedSpeech || interimTranscript.length > 0);

        if (detectedSpeech || interimTranscript.length > 0) {
          clearTimeout(recognitionRef.current._speakingTimeout);
          recognitionRef.current._speakingTimeout = setTimeout(() => {
            setIsSpeaking(false);
          }, 1000);
        }
      };

      // Don't forget to reset finalizedTranscript when moving to next question
      // Add this to your handleNextQuestion function:
      setFinalizedTranscript("");
    } else {
      console.log("Speech recognition not supported");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log("Error stopping recognition:", error);
        }
      }
    };
  }, []);

  // Mock fetch questions - replace with actual API call
  useEffect(() => {
    const fetchQuestions = async () => {
      const queryParams = new URLSearchParams(location.search);
      const resumeId = queryParams.get("resumeId");
      const duration = queryParams.get("duration");

      if (!resumeId || !duration) {
        console.error("Missing resumeId or duration in URL");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/interview/questions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              resumeId,
              duration: Number(duration),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setCurrentQuestion(data.questions[0]);
          setQuestionTimer(data.questions[0].time);
          speakText(data.questions[0].question);
        } else {
          console.error("No questions found in response");
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Start media stream
  useEffect(() => {
    const startMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    startMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Overall interview timer
  useEffect(() => {
    overallTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (overallTimerRef.current) {
        clearInterval(overallTimerRef.current);
      }
    };
  }, []);

  // Question timer
  useEffect(() => {
    if (!currentQuestion || isAISpeaking) return;

    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }

    questionTimerRef.current = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (!isAISpeaking) {
      startSpeechRecognition();
    }

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [currentQuestion, isAISpeaking]);

  // Start speech recognition when conditions are right
  const startSpeechRecognition = () => {
    if (
      speechSupported &&
      recognitionRef.current &&
      isAudioOn &&
      !isListening &&
      !isStartingRef.current &&
      !isAISpeaking
    ) {
      try {
        isStartingRef.current = true;
        recognitionRef.current.start();
      } catch (error) {
        console.log("Recognition start failed:", error);
        isStartingRef.current = false;
      }
    }
  };

  // Stop speech recognition
  const stopSpeechRecognition = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Recognition stop failed:", error);
      }
    }
  };

  const speakText = (text) => {
    setIsAISpeaking(true);
    stopSpeechRecognition();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.onend = () => {
      setIsAISpeaking(false);
      // Start listening after AI finishes speaking
      setTimeout(() => {
        startSpeechRecognition();
      }, 1000);
    };
    speechSynthesis.speak(utterance);
  };

  const handleNextQuestion = () => {
    stopSpeechRecognition();

    // Save current answer
    if (currentQuestion) {
      setAnswers((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          answer: currentAnswer.trim() || "No answer provided",
        },
      ]);
    }

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setQuestionTimer(questions[nextIndex].time);
      setCurrentAnswer("");
      setTranscript("");

      // Speak next question
      speakText(questions[nextIndex].question);
    } else {
      // Interview completed - endCall will handle the final logging
      endCall();
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioOn;
      });

      const newAudioState = !isAudioOn;
      setIsAudioOn(newAudioState);

      if (newAudioState) {
        startSpeechRecognition(); // Auto-start speech recognition when mic is on
      } else {
        stopSpeechRecognition(); // Stop recognition when mic is off
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const endCall = () => {
    // Stop timers
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
    if (overallTimerRef.current) {
      clearInterval(overallTimerRef.current);
    }

    // Stop media stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Stop speech recognition
    stopSpeechRecognition();

    // Save the final answer if we're in the middle of a question
    let finalAnswers = [...answers];
    if (currentQuestion && currentAnswer.trim()) {
      finalAnswers.push({
        question: currentQuestion.question,
        answer: currentAnswer.trim(),
      });
    }

    // Display all questions and answers in console
    console.log("=".repeat(60));
    console.log("INTERVIEW COMPLETED - QUESTIONS & ANSWERS");
    console.log("=".repeat(60));

    finalAnswers.forEach((qa, index) => {
      console.log(`\n📝 QUESTION ${index + 1}:`);
      console.log(`"${qa.question}"`);
      console.log(`\n💬 ANSWER:`);
      console.log(`"${qa.answer || "No answer provided"}"`);
      console.log("-".repeat(40));
    });

    console.log(`\n📊 INTERVIEW SUMMARY:`);
    console.log(`Total Questions: ${questions.length}`);
    console.log(`Questions Answered: ${finalAnswers.length}`);
    console.log(
      `Completion Rate: ${Math.round(
        (finalAnswers.length / questions.length) * 100
      )}%`
    );
    console.log("=".repeat(60));

    // Also log as a structured object for easy copying
    console.log("\n🔗 STRUCTURED DATA (for copying):");
    console.log(
      JSON.stringify(
        {
          interviewDate: new Date().toISOString(),
          totalQuestions: questions.length,
          questionsAnswered: finalAnswers.length,
          completionRate: Math.round(
            (finalAnswers.length / questions.length) * 100
          ),
          qa: finalAnswers,
        },
        null,
        2
      )
    );

    setIsInterviewEnded(true);
  };

  const confirmEndCall = () => {
    if (window.confirm("Are you sure you want to end the interview?")) {
      endCall();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const manualStartRecognition = () => {
    if (!isAISpeaking) {
      startSpeechRecognition();
    }
  };

  const queryParams = new URLSearchParams(location.search);
  const resumeId = queryParams.get("resumeId");
  useEffect(() => {
    if (isInterviewEnded && answers.length > 0 && resumeId) {
      fetch("http://localhost:3000/api/interview/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          userId: localStorage.getItem("token"), // sending resumeId instead of content
          qa: answers.map((a, idx) => ({
            question: questions[idx],
            answer: a,
          })),
        }),
      })
        .then((res) => res.json())
        .then((data) => setAssessment(data.assessment))
        .catch((err) => console.error("Error fetching assessment:", err));
    }
  }, [isInterviewEnded]);

  // Replace your interview end view with this stylized version:

  if (isInterviewEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 animate-pulse">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Interview Completed!
            </h1>
            <p className="text-gray-300 text-lg">
              Thank you for participating in the AI-powered interview
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {answers.length}
              </div>
              <div className="text-gray-300">Questions Answered</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {questions.length > 0
                  ? Math.round((answers.length / questions.length) * 100)
                  : 0}
                %
              </div>
              <div className="text-gray-300">Completion Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {assessment?.score || "N/A"}/10
              </div>
              <div className="text-gray-300">Overall Score</div>
            </div>
          </div>

          {/* Assessment Section */}
          {assessment ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              {/* Assessment Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <svg
                    className="w-8 h-8 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Final Assessment Report
                </h2>
                <p className="text-blue-100 mt-2">
                  AI-generated evaluation based on your responses
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Score and Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400">
                      {assessment.score}/10
                    </div>
                    <div className="text-sm text-gray-300">Overall Score</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="text-lg font-semibold text-green-400 capitalize">
                      {assessment.clarity?.split(".")[0] || "N/A"}
                    </div>
                    <div className="text-sm text-gray-300">Clarity</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <div className="text-lg font-semibold text-purple-400 capitalize">
                      {assessment.technical?.split(".")[0] || "N/A"}
                    </div>
                    <div className="text-sm text-gray-300">Technical</div>
                  </div>
                  <div className="text-center p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <div className="text-lg font-semibold text-orange-400 capitalize">
                      {assessment.professionalism?.split(".")[0] || "N/A"}
                    </div>
                    <div className="text-sm text-gray-300">Professional</div>
                  </div>
                </div>

                {/* Detailed Assessment */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
                    <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                      Strengths
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {assessment.strengths}
                    </p>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
                    <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center">
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        ></path>
                      </svg>
                      Areas for Improvement
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {assessment.weaknesses}
                    </p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Detailed Evaluation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-blue-400 mb-2">
                        Communication Clarity
                      </h4>
                      <p className="text-sm text-gray-300">
                        {assessment.clarity}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-purple-400 mb-2">
                        Technical Knowledge
                      </h4>
                      <p className="text-sm text-gray-300">
                        {assessment.technical}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-green-400 mb-2">
                        Response Completeness
                      </h4>
                      <p className="text-sm text-gray-300">
                        {assessment.completeness}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-orange-400 mb-2">
                        Professionalism
                      </h4>
                      <p className="text-sm text-gray-300">
                        {assessment.professionalism}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      ></path>
                    </svg>
                    Recommendations for Improvement
                  </h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {assessment.suggestions}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75 mx-auto mb-6"></div>
              <p className="text-xl text-gray-300 mb-2">
                Generating Your Assessment...
              </p>
              <p className="text-gray-400">
                Our AI is analyzing your responses. This may take a few moments.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-blue-500/25"
            >
              Start New Interview
            </button>

            <button
              onClick={() => {
                const reportData = {
                  timestamp: new Date().toISOString(),
                  questionsAnswered: answers.length,
                  totalQuestions: questions.length,
                  completionRate:
                    questions.length > 0
                      ? Math.round((answers.length / questions.length) * 100)
                      : 0,
                  assessment: assessment,
                };

                const dataStr = JSON.stringify(reportData, null, 2);
                const dataBlob = new Blob([dataStr], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `interview-report-${
                  new Date().toISOString().split("T")[0]
                }.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-purple-500/25"
            >
              Download Report
            </button>

            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200 font-semibold backdrop-blur-sm"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }


  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75 mx-auto mb-4"></div>
          <p className="text-xl font-semibold">
            Preparing interview questions...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            This may take a few seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {/* User Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={userVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${!isVideoOn && "hidden"}`}
          />
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-4xl text-white">U</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black bg-opacity-50 px-3 py-1 rounded text-white">
            <span>You</span>
            {isSpeaking && (
              <div className="flex space-x-1 items-end h-4">
                <div className="w-1 h-2 bg-green-400 animate-pulse rounded"></div>
                <div className="w-1 h-3 bg-green-500 animate-pulse rounded"></div>
                <div className="w-1 h-2 bg-green-400 animate-pulse rounded"></div>
              </div>
            )}
          </div>

          {/* Live Transcription */}
          {speechSupported && (
            <div className="absolute bottom-12 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg max-h-32 overflow-y-auto">
              <div className="text-xs text-gray-300 mb-1 flex items-center justify-between">
                <span>Live Transcription</span>
                <div className="flex items-center space-x-2">
                  {isListening && (
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                      Listening
                    </span>
                  )}
                  {!isListening &&
                    speechSupported &&
                    isAudioOn &&
                    !isAISpeaking && (
                      <button
                        onClick={manualStartRecognition}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Start
                      </button>
                    )}
                </div>
              </div>
              <div className="text-sm leading-relaxed">
                {transcript ||
                  (isAISpeaking
                    ? "AI is speaking..."
                    : isAudioOn && speechSupported
                    ? "Start speaking..."
                    : "Microphone is off")}
              </div>
            </div>
          )}

          {!speechSupported && (
            <div className="absolute bottom-12 left-4 right-4 bg-yellow-600 bg-opacity-70 text-white p-3 rounded-lg">
              <div className="text-xs mb-1">Speech Recognition</div>
              <div className="text-sm">Not supported in this browser</div>
            </div>
          )}
        </div>

        {/* AI Interviewer */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-4xl text-white">AI</span>
            </div>
          </div>

          {/* Timer Display */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded">
            Time Left: {formatTime(timeLeft)}
          </div>

          <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded flex items-center">
            AI Interviewer
            {isAISpeaking && (
              <div className="ml-2 flex space-x-1 items-end h-4">
                <div className="w-1 h-2 bg-blue-400 animate-pulse rounded"></div>
                <div className="w-1 h-3 bg-blue-500 animate-pulse rounded"></div>
                <div className="w-1 h-2 bg-blue-400 animate-pulse rounded"></div>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 right-4 w-72 max-h-32 overflow-y-auto bg-black bg-opacity-60 text-white text-sm rounded-md p-2">
            <div className="text-xs text-gray-300 mb-1 flex justify-between">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{questionTimer}s</span>
            </div>
            <p>{currentQuestion?.question || "Loading question..."}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4 items-center relative">
          {/* Mic Warning Tooltip */}
          {!isAudioOn && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <div className="bg-yellow-500 text-black text-sm px-3 py-1 rounded shadow-md flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
                Mic is off — please turn it on to answer
              </div>
            </div>
          )}

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              isAudioOn
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-500 hover:bg-red-600"
            } transition-colors`}
          >
            {isAudioOn ? (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoOn
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-500 hover:bg-red-600"
            } transition-colors`}
          >
            {isVideoOn ? (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3l18 18"
                />
              </svg>
            )}
          </button>

          {/* Next Question Button */}
          <button
            onClick={handleNextQuestion}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Next Question
          </button>

          {/* End Call */}
          <button
            onClick={confirmEndCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interview;
