import { getUserData } from "./authService";

interface ApiQuizQuestion {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
}

interface ApiQuizResponse {
    quiz: {
        title?: string;
        questions: ApiQuizQuestion[];
    } | ApiQuizQuestion[]; // Add support for direct array format
}

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export const generateQuizQuestions = async (
    topic: string,
    numberOfQuestions: number
): Promise<QuizQuestion[]> => {
    try {
        // Make API request
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}api/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic,
                number_of_questions: numberOfQuestions
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data: ApiQuizResponse = await response.json();

        // Handle different response formats
        let questions: ApiQuizQuestion[] = [];

        if (Array.isArray(data.quiz)) {
            // Direct array format
            questions = data.quiz;
        } else if (data.quiz && data.quiz.questions) {
            // Nested format with questions wrapper
            questions = data.quiz.questions;
        } else {
            throw new Error('Unexpected API response format');
        }

        // Transform API response to our app's format
        return questions.map((q, index) => {
            // Convert letter answer (A, B, C, D) to actual option
            const letterToIndex: Record<string, number> = {
                'A': 0,
                'B': 1,
                'C': 2,
                'D': 3,
                'E': 4
            };

            let correctAnswerIndex = -1;
            let correctAnswer = '';
            let options = [...q.options]; // Create a copy of options to modify if needed

            // Handle different answer formats
            if (q.answer === 'None of the above (all are valid)' ||
                q.answer.toLowerCase() === 'none of the above') {
                // Special case for this specific answer
                correctAnswerIndex = q.options.findIndex(o =>
                    o.toLowerCase().includes('none of the above'));
                if (correctAnswerIndex === -1) {
                    // If not found in options, use the last option
                    correctAnswerIndex = q.options.length - 1;
                }
                correctAnswer = q.options[correctAnswerIndex];
            } else if (q.answer.length === 1 && letterToIndex[q.answer] !== undefined) {
                // Letter answer (A, B, C, D)
                correctAnswerIndex = letterToIndex[q.answer];
                if (correctAnswerIndex < options.length) {
                    correctAnswer = options[correctAnswerIndex];
                } else {
                    // If the letter index is out of bounds, use the answer text directly
                    correctAnswer = q.answer;
                }
            } else if (q.answer.toLowerCase() === 'all of the above' ||
                q.answer.toLowerCase() === 'd' &&
                options.some(opt => opt.toLowerCase().includes('all of the above'))) {
                // Handle "all of the above" answers
                correctAnswerIndex = options.findIndex(opt =>
                    opt.toLowerCase().includes('all of the above'));
                if (correctAnswerIndex === -1) {
                    // If not found in options, check for option D which might be "all of the above"
                    if (options.length >= 4 && options[3].toLowerCase().includes('all')) {
                        correctAnswerIndex = 3;
                    } else {
                        // Last resort: add it as an option
                        options.push('All of the above');
                        correctAnswerIndex = options.length - 1;
                    }
                }
                correctAnswer = options[correctAnswerIndex];
            } else {
                // Direct text match - check if the answer is in the options
                correctAnswerIndex = q.options.findIndex(option => option === q.answer);
                if (correctAnswerIndex === -1) {
                    // Answer not found in options - add it as an additional option
                    options.push(q.answer);
                    correctAnswerIndex = options.length - 1;
                    correctAnswer = q.answer;
                } else {
                    correctAnswer = q.options[correctAnswerIndex];
                }
            }

            return {
                id: index + 1,
                question: q.question,
                options: options,
                correctAnswer,
                explanation: q.explanation || "No explanation provided"
            };
        });
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        // Fallback to mock data if API fails
        return getMockQuestions(topic, numberOfQuestions);
    }
};

// Save quiz results
export const saveQuizResults = async (
    userId: string,
    topic: string,
    score: number,
    totalQuestions: number,
    questions?: QuizQuestion[],
    userAnswers?: (string | null)[]
): Promise<boolean> => {
    const userData = getUserData();
    try {
        // Example payload for saving quiz results
        const payload = {
            userId,
            topic,
            score,
            totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            completedAt: new Date().toISOString(),
            // Add question details if available
            questionDetails: questions && userAnswers ? questions.map((question, index) => ({
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                userAnswer: userAnswers[index],
                isCorrect: userAnswers[index] === question.correctAnswer
            })) : undefined
        };

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}api/save-quiz?user_id=${userData?.uid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Failed to save quiz results:', error);
        return false;
    }
};

// Get quiz history
export const getQuizHistory = async (userId: string) => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}api/latest-quiz-results?user_id=${userId}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Transform the API response to a format suitable for our UI
        return data.quizResults.map((result: any) => {
            // Format date to be more readable
            const completedDate = new Date(result.completedAt);
            const now = new Date();

            // Calculate time difference
            const diffTime = Math.abs(now.getTime() - completedDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            let dateText;
            if (diffDays === 0) {
                dateText = 'Today';
            } else if (diffDays === 1) {
                dateText = 'Yesterday';
            } else if (diffDays < 7) {
                dateText = `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                dateText = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
            } else {
                dateText = completedDate.toLocaleDateString();
            }

            return {
                id: result.createdAt, // Using createdAt as a unique ID
                topic: result.topic,
                score: `${result.score}/${result.totalQuestions}`,
                percentage: result.percentage,
                date: dateText,
                completedAt: result.completedAt,
                questionDetails: result.questionDetails
            };
        });
    } catch (error) {
        console.error('Error fetching quiz history:', error);
        // Return empty array if there's an error
        return [];
    }
};

// Get all quiz history
export const getAllQuizHistory = async (userId: string) => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}api/all-quiz-results?user_id=${userId}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Format quiz results
        return data.quizResults.map((result: any) => {
            // Format date to be more readable
            const completedDate = new Date(result.completedAt);

            return {
                id: result.createdAt,
                topic: result.topic,
                score: `${result.score}/${result.totalQuestions}`,
                percentage: result.percentage,
                date: completedDate.toLocaleDateString(),
                time: completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                completedAt: result.completedAt,
                questionDetails: result.questionDetails
            };
        });
    } catch (error) {
        console.error('Error fetching all quiz history:', error);
        return [];
    }
};

// Mock questions as fallback if API fails
const getMockQuestions = (topic: string, numberOfQuestions: number): QuizQuestion[] => {
    const questionsByTopic: Record<string, QuizQuestion[]> = {
        'React Native': [
            {
                id: 1,
                question: 'What is the main difference between React Native and React?',
                options: [
                    'React Native is used for mobile apps, React is for web apps',
                    'React Native uses Swift, React uses JavaScript',
                    'React Native is newer than React',
                    'There is no difference'
                ],
                correctAnswer: 'React Native is used for mobile apps, React is for web apps',
                explanation: 'React Native is a framework for building native mobile apps using JavaScript and React, while React is a JavaScript library for building user interfaces primarily for web applications.'
            },
            {
                id: 2,
                question: 'Which component is used to render multiple items in React Native?',
                options: ['View', 'ScrollView', 'FlatList', 'Text'],
                correctAnswer: 'FlatList',
                explanation: 'FlatList is designed to render scrollable lists efficiently, especially with large datasets.'
            },
            {
                id: 3,
                question: 'What is "expo" in React Native?',
                options: [
                    'A build tool',
                    'A component library',
                    'A framework and platform for React Native',
                    'A testing library'
                ],
                correctAnswer: 'A framework and platform for React Native',
                explanation: 'Expo is a framework and platform for universal React applications that provides a set of tools and services for building React Native apps.'
            },
            {
                id: 4,
                question: 'How do you handle navigation in React Native?',
                options: [
                    'Using HTML links',
                    'Using React Router',
                    'Using React Navigation',
                    'Using URL parameters'
                ],
                correctAnswer: 'Using React Navigation',
                explanation: 'React Navigation is a popular library for handling navigation in React Native apps.'
            },
            {
                id: 5,
                question: 'Which of these is NOT a React Native core component?',
                options: ['View', 'Text', 'Image', 'Div'],
                correctAnswer: 'Div',
                explanation: 'Div is an HTML element used in web development. In React Native, you use View instead of Div.'
            }
        ],
        'JavaScript': [
            {
                id: 1,
                question: 'What is a closure in JavaScript?',
                options: [
                    'A way to close browser windows',
                    'A function that has access to variables in its outer lexical environment',
                    'A method to end JavaScript execution',
                    'A data type in JavaScript'
                ],
                correctAnswer: 'A function that has access to variables in its outer lexical environment',
                explanation: 'A closure is a function that remembers its outer variables and can access them.'
            },
            {
                id: 2,
                question: 'Which operator is used for strict equality in JavaScript?',
                options: ['==', '===', '=', '!='],
                correctAnswer: '===',
                explanation: 'The === operator checks both value and type equality without type conversion.'
            },
            {
                id: 3,
                question: 'What is the purpose of the "this" keyword in JavaScript?',
                options: [
                    'It refers to the current HTML document',
                    'It refers to the current function',
                    'It refers to the context in which a function is executed',
                    'It is a reserved word with no special meaning'
                ],
                correctAnswer: 'It refers to the context in which a function is executed',
                explanation: 'The "this" keyword refers to the object it belongs to and has different values depending on where it is used.'
            },
            {
                id: 4,
                question: 'What is the output of: console.log(typeof [])?',
                options: ['array', 'object', 'undefined', 'null'],
                correctAnswer: 'object',
                explanation: 'In JavaScript, arrays are technically objects, so typeof [] returns "object".'
            },
            {
                id: 5,
                question: 'What is a Promise in JavaScript?',
                options: [
                    'A guarantee of future execution',
                    'An object representing the eventual completion or failure of an asynchronous operation',
                    'A special type of function',
                    'A way to declare variables'
                ],
                correctAnswer: 'An object representing the eventual completion or failure of an asynchronous operation',
                explanation: 'A Promise is an object that may produce a single value sometime in the future: either a resolved value, or a reason it was not resolved (rejected).'
            }
        ],
        'Python': [
            {
                id: 1,
                question: 'What is the output of: print(2**3)?',
                options: ['6', '8', '5', 'Error'],
                correctAnswer: '8',
                explanation: 'The ** operator in Python represents exponentiation. 2**3 equals 2³, which is 8.'
            },
            {
                id: 2,
                question: 'Which of the following is NOT a Python data type?',
                options: ['List', 'Dictionary', 'Tuple', 'Array'],
                correctAnswer: 'Array',
                explanation: 'Array is not a built-in data type in Python. Python uses Lists instead. Arrays exist in the NumPy library.'
            },
            {
                id: 3,
                question: 'What will be the output of: print("Hello"[1])?',
                options: ['H', 'e', 'Hello', 'Error'],
                correctAnswer: 'e',
                explanation: 'In Python, strings can be indexed like arrays. The index 1 refers to the second character, which is "e".'
            },
            {
                id: 4,
                question: 'Which function is used to get the length of a list in Python?',
                options: ['size()', 'length()', 'len()', 'count()'],
                correctAnswer: 'len()',
                explanation: 'The len() function returns the number of items in an object like a list, string, or dictionary.'
            },
            {
                id: 5,
                question: 'What does the "self" parameter in Python class methods refer to?',
                options: [
                    'The class itself',
                    'The instance of the class',
                    'A reserved keyword',
                    'The parent class'
                ],
                correctAnswer: 'The instance of the class',
                explanation: 'The "self" parameter refers to the instance of the class and is used to access variables and methods associated with the instance.'
            }
        ],
        'Next.js': [
            {
                id: 1,
                question: 'What is Next.js?',
                options: [
                    'A CSS framework',
                    'A React framework for production',
                    'A JavaScript testing library',
                    'A database management system'
                ],
                correctAnswer: 'A React framework for production',
                explanation: 'Next.js is a React framework for production that provides features like server-side rendering, static site generation, and routing.'
            },
            {
                id: 2,
                question: 'Which feature does Next.js provide out of the box?',
                options: [
                    'State management',
                    'File-based routing',
                    'UI components',
                    'Database connections'
                ],
                correctAnswer: 'File-based routing',
                explanation: 'Next.js provides file-based routing where files in the pages directory automatically become routes.'
            },
            {
                id: 3,
                question: 'What is the purpose of getStaticProps in Next.js?',
                options: [
                    'To fetch data on the client side',
                    'To fetch data at build time for static pages',
                    'To handle form submissions',
                    'To manage component state'
                ],
                correctAnswer: 'To fetch data at build time for static pages',
                explanation: 'getStaticProps allows you to fetch data at build time and pass it as props to the page component for static site generation (SSG).'
            },
            {
                id: 4,
                question: 'Which of these Next.js features allows you to pre-render a page whose data must be fetched at request time?',
                options: [
                    'getStaticProps',
                    'getServerSideProps',
                    'useEffect',
                    'getInitialProps'
                ],
                correctAnswer: 'getServerSideProps',
                explanation: 'getServerSideProps fetches data on each request for server-side rendering (SSR).'
            },
            {
                id: 5,
                question: 'What is the purpose of the "pages/api" directory in Next.js?',
                options: [
                    'For storing API documentation',
                    'For creating serverless API endpoints',
                    'For API client configuration',
                    'It has no special purpose'
                ],
                correctAnswer: 'For creating serverless API endpoints',
                explanation: 'Files inside the pages/api directory are treated as API endpoints instead of React pages and can be used to create serverless functions.'
            }
        ],
        'Machine Learning': [
            {
                id: 1,
                question: 'What is supervised learning?',
                options: [
                    'Learning without a teacher',
                    'Learning with labeled data',
                    'Learning through reinforcement',
                    'Learning through clustering'
                ],
                correctAnswer: 'Learning with labeled data',
                explanation: 'Supervised learning is when an algorithm learns from labeled training data to make predictions or decisions.'
            },
            {
                id: 2,
                question: 'Which of these is NOT a type of machine learning?',
                options: [
                    'Supervised learning',
                    'Unsupervised learning',
                    'Reinforcement learning',
                    'Prescribed learning'
                ],
                correctAnswer: 'Prescribed learning',
                explanation: 'Prescribed learning is not a standard type of machine learning. The three main types are supervised, unsupervised, and reinforcement learning.'
            },
            {
                id: 3,
                question: 'What is a neural network?',
                options: [
                    'A network of computers',
                    'A biological network of neurons',
                    'A computational model inspired by the human brain',
                    'A network protocol'
                ],
                correctAnswer: 'A computational model inspired by the human brain',
                explanation: 'Neural networks are computational systems inspired by the biological neural networks in the human brain.'
            },
            {
                id: 4,
                question: 'What does "overfitting" mean in machine learning?',
                options: [
                    'When a model performs too well',
                    'When a model learns the training data too well and performs poorly on new data',
                    'When a model is too complex',
                    'When a dataset is too large'
                ],
                correctAnswer: 'When a model learns the training data too well and performs poorly on new data',
                explanation: 'Overfitting occurs when a model learns the details and noise in the training data to the extent that it negatively impacts the performance on new data.'
            },
            {
                id: 5,
                question: 'Which algorithm is commonly used for classification problems?',
                options: [
                    'Linear regression',
                    'K-means clustering',
                    'Decision trees',
                    'Principal Component Analysis'
                ],
                correctAnswer: 'Decision trees',
                explanation: 'Decision trees are commonly used for classification problems as they can create clear decision boundaries between classes.'
            }
        ]
    };

    // Get raw questions for the requested topic or default to React Native
    const rawQuestions = questionsByTopic[topic] || questionsByTopic['React Native'];

    // Process questions to handle answers not in options
    const processedQuestions = rawQuestions.map(q => {
        // Check if the correct answer is in the options
        const correctAnswerIndex = q.options.findIndex(option => option === q.correctAnswer);

        if (correctAnswerIndex === -1) {
            // If the correct answer is not in the options, add it
            return {
                ...q,
                options: [...q.options, q.correctAnswer],
            };
        }

        // If the correct answer is already in the options, return as is
        return q;
    });

    // Return the requested number of questions
    return processedQuestions.slice(0, numberOfQuestions);
}; 