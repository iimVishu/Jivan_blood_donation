"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ChevronRight, RefreshCw, Heart, Droplet, Clock, Calendar } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'yesno' | 'select' | 'number';
  options?: string[];
  disqualifyIf?: string | number | boolean;
  warningIf?: string | number | boolean;
  info?: string;
}

const eligibilityQuestions: Question[] = [
  {
    id: 'age',
    question: 'How old are you?',
    type: 'number',
    disqualifyIf: 17,
    info: 'You must be at least 18 years old to donate blood.',
  },
  {
    id: 'weight',
    question: 'What is your weight (in kg)?',
    type: 'number',
    disqualifyIf: 44,
    info: 'You must weigh at least 45 kg to donate blood.',
  },
  {
    id: 'feeling_well',
    question: 'Are you feeling healthy and well today?',
    type: 'yesno',
    disqualifyIf: false,
    info: 'You should feel completely healthy on the day of donation.',
  },
  {
    id: 'recent_illness',
    question: 'Have you had any cold, flu, or infection in the past 2 weeks?',
    type: 'yesno',
    disqualifyIf: true,
    info: 'Wait at least 14 days after recovering from any illness.',
  },
  {
    id: 'medications',
    question: 'Are you currently taking any medications (except vitamins)?',
    type: 'yesno',
    warningIf: true,
    info: 'Some medications may temporarily disqualify you. Please consult with the blood bank.',
  },
  {
    id: 'tattoo_piercing',
    question: 'Have you gotten a tattoo or piercing in the last 6 months?',
    type: 'yesno',
    disqualifyIf: true,
    info: 'Wait 6 months after getting a tattoo or piercing.',
  },
  {
    id: 'surgery',
    question: 'Have you had any surgery in the last 6 months?',
    type: 'yesno',
    disqualifyIf: true,
    info: 'Wait 6 months after any major surgery.',
  },
  {
    id: 'pregnant',
    question: 'Are you currently pregnant or have given birth in the last 6 months?',
    type: 'yesno',
    disqualifyIf: true,
    info: 'Wait 6 months after pregnancy to donate.',
  },
  {
    id: 'last_donation',
    question: 'When was your last blood donation?',
    type: 'select',
    options: ['Never donated', 'More than 3 months ago', '1-3 months ago', 'Less than 1 month ago'],
    disqualifyIf: 'Less than 1 month ago',
    warningIf: '1-3 months ago',
    info: 'Wait at least 56 days (about 3 months) between whole blood donations.',
  },
  {
    id: 'hemoglobin',
    question: 'Do you know if your hemoglobin level is above 12.5 g/dL?',
    type: 'select',
    options: ['Yes, it is above 12.5', 'No, it is below 12.5', 'I don\'t know'],
    disqualifyIf: 'No, it is below 12.5',
    info: 'Hemoglobin level will be checked at the blood bank.',
  },
  {
    id: 'chronic_conditions',
    question: 'Do you have any chronic conditions (diabetes, heart disease, etc.)?',
    type: 'yesno',
    warningIf: true,
    info: 'Some conditions may affect eligibility. Please consult with the blood bank.',
  },
  {
    id: 'travel',
    question: 'Have you traveled to a malaria-endemic area in the last 3 months?',
    type: 'yesno',
    disqualifyIf: true,
    info: 'Wait 3 months after returning from malaria-endemic regions.',
  },
];

export default function EligibilityChecker() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<'eligible' | 'ineligible' | 'warning' | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [started, setStarted] = useState(false);

  const handleAnswer = (answer: any) => {
    const question = eligibilityQuestions[currentQuestion];
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    // Check for disqualification
    if (question.type === 'number') {
      if (question.disqualifyIf && answer <= question.disqualifyIf) {
        setIssues([...issues, question.info || question.question]);
      }
    } else {
      if (answer === question.disqualifyIf) {
        setIssues([...issues, question.info || question.question]);
      }
    }

    // Move to next question or show result
    if (currentQuestion < eligibilityQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: Record<string, any>) => {
    let hasDisqualification = false;
    let hasWarning = false;
    const issueList: string[] = [];

    eligibilityQuestions.forEach((q) => {
      const answer = finalAnswers[q.id];
      
      if (q.type === 'number') {
        if (q.disqualifyIf && answer <= q.disqualifyIf) {
          hasDisqualification = true;
          issueList.push(q.info || q.question);
        }
      } else {
        if (answer === q.disqualifyIf) {
          hasDisqualification = true;
          issueList.push(q.info || q.question);
        } else if (answer === q.warningIf) {
          hasWarning = true;
          issueList.push(q.info || q.question);
        }
      }
    });

    setIssues(issueList);
    
    if (hasDisqualification) {
      setResult('ineligible');
    } else if (hasWarning) {
      setResult('warning');
    } else {
      setResult('eligible');
    }
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setIssues([]);
    setStarted(false);
  };

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Blood Donation Eligibility Checker
          </h2>
          <p className="text-gray-600 mb-8">
            Answer a few quick questions to check if you're eligible to donate blood today. 
            This takes about 2 minutes.
          </p>
          
          <div className="flex items-center justify-center gap-8 mb-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              <span>{eligibilityQuestions.length} questions</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStarted(true)}
            className="px-8 py-4 bg-red-600 text-white rounded-full font-semibold text-lg hover:bg-red-700 transition-colors"
          >
            Start Eligibility Check
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto"
      >
        <div className="text-center">
          {result === 'eligible' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-14 h-14 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-green-700 mb-4">
                You're Eligible to Donate! 🎉
              </h2>
              <p className="text-gray-600 mb-8">
                Based on your answers, you appear to be eligible to donate blood. 
                Schedule an appointment at your nearest blood bank today!
              </p>
              <div className="flex gap-4 justify-center">
                <motion.a
                  href="/donate"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Schedule Donation
                </motion.a>
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Again
                </button>
              </div>
            </>
          )}

          {result === 'ineligible' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <XCircle className="w-14 h-14 text-red-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                Not Eligible Right Now
              </h2>
              <p className="text-gray-600 mb-6">
                Based on your answers, you may not be eligible to donate blood at this time. 
                Here's why:
              </p>
              <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
                <ul className="space-y-2">
                  {issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-700">
                      <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Please consult with your doctor or blood bank for more information.
              </p>
              <button
                onClick={reset}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Check Again
              </button>
            </>
          )}

          {result === 'warning' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <AlertTriangle className="w-14 h-14 text-yellow-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-yellow-700 mb-4">
                Possible Eligibility - Please Consult
              </h2>
              <p className="text-gray-600 mb-6">
                You may be eligible, but some of your answers need verification. 
                Please discuss with the blood bank staff.
              </p>
              <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
                <ul className="space-y-2">
                  {issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2 text-yellow-700">
                      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <motion.a
                  href="/donate"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Find Blood Bank
                </motion.a>
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Again
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  const question = eligibilityQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / eligibilityQuestions.length) * 100;

  return (
    <motion.div
      key={currentQuestion}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto"
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {currentQuestion + 1} of {eligibilityQuestions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-red-600"
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {question.question}
      </h3>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.type === 'yesno' && (
          <>
            <button
              onClick={() => handleAnswer(true)}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-colors flex items-center justify-between group"
            >
              <span className="font-medium">Yes</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-colors flex items-center justify-between group"
            >
              <span className="font-medium">No</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            </button>
          </>
        )}

        {question.type === 'select' && question.options?.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-colors flex items-center justify-between group"
          >
            <span className="font-medium">{option}</span>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
          </button>
        ))}

        {question.type === 'number' && (
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Enter your answer"
              className="flex-1 p-4 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (!isNaN(value)) handleAnswer(value);
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                const value = parseInt(input?.value);
                if (!isNaN(value)) handleAnswer(value);
              }}
              className="px-6 py-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Info Text */}
      {question.info && (
        <p className="mt-6 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
          ℹ️ {question.info}
        </p>
      )}
    </motion.div>
  );
}
