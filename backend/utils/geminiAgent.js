import { GoogleGenerativeAI } from "@google/generative-ai";

// // Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateInterviewQuestions = async (resumeContent, duration) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an AI interview assistant. Based on the resume below, generate a list of interview questions for a mock interview lasting ${duration} minutes.
Each question should be specific to the candidate's experience and skills mentioned in the resume.
Return the questions in JSON format like this:
[
  { "question": "Question text", "time": estimatedTimeInSeconds },
  ...
]

Resume:
${resumeContent}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 🔥 Strip markdown-style code blocks if present
        if (text.startsWith("```")) {
            text = text.replace(/```(?:json)?\n?/g, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(text);
        return parsed;
    } catch (err) {
        console.error("Error generating questions from Gemini:", err.message);
        return [];
    }
};


// export const generateInterviewQuestions = async (resumeContent, duration) => {
//     // Simulate network delay
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     return [
//         { question: "Can you walk me through your resume?", time: 60 },
//         { question: "Tell me about a challenging project you've worked on.", time: 90 },
//         { question: "What are your strengths and weaknesses?", time: 60 },
//         { question: "How do you approach problem-solving?", time: 60 },
//         { question: "Where do you see yourself in 5 years?", time: 60 },
//         { question: "Do you have experience with React and Node.js?", time: 90 },
//         { question: "Can you describe a time you worked in a team?", time: 90 },
//     ];
// };

export const assessInterview = async (resumeContent, qa) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an AI interviewer assessing a candidate. Below is their resume content and their answers to interview questions.

Resume:
${resumeContent}

Interview Q&A:
${qa.map((item, index) => `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer || 'No answer provided'}`).join('\n\n')}

Please give an assessment of the candidate including:
- Overall score out of 10
- Clarity of communication
- Technical understanding
- Completeness of answers
- Professionalism
- Strengths and weaknesses
- Suggestions for improvement

Respond in JSON format:
{
  "score": number,
  "clarity": string,
  "technical": string,
  "completeness": string,
  "professionalism": string,
  "strengths": string,
  "weaknesses": string,
  "suggestions": string
}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up code block formatting if necessary
        if (text.startsWith("```")) {
            text = text.replace(/```(?:json)?\n?/g, "").replace(/```$/, "").trim();
        }

        return JSON.parse(text);
    } catch (err) {
        console.error("Error during assessment:", err.message);
        return null;
    }
};
