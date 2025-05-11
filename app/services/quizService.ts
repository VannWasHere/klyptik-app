// Mock data for AI-generated questions
// In a real app, this would be an API call to an AI service

// Interface for API response
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
    };
}

// Interface for our app's question format
export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

// Generate quiz questions based on topic and number of questions
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

        // Transform API response to our app's format
        return data.quiz.questions.map((q, index) => {
            // Convert letter answer (A, B, C, D) to actual option
            const letterToIndex: Record<string, number> = {
                'A': 0,
                'B': 1,
                'C': 2,
                'D': 3,
                'E': 4
            };

            let correctAnswerIndex = 0;

            // Handle different answer formats
            if (q.answer === 'None of the above (all are valid)') {
                // Special case for this specific answer
                correctAnswerIndex = q.options.findIndex(o => o === 'None of the above (all are valid)');
                if (correctAnswerIndex === -1) {
                    // If not found in options, use the last option
                    correctAnswerIndex = q.options.length - 1;
                }
            } else if (q.answer.length === 1 && letterToIndex[q.answer]) {
                // Letter answer (A, B, C, D)
                correctAnswerIndex = letterToIndex[q.answer];
            } else {
                // Direct text match
                correctAnswerIndex = q.options.findIndex(option => option === q.answer);
                if (correctAnswerIndex === -1) correctAnswerIndex = 0; // Default to first if not found
            }

            const correctAnswer = q.options[correctAnswerIndex];

            return {
                id: index + 1,
                question: q.question,
                options: q.options,
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
    totalQuestions: number
): Promise<boolean> => {
    try {
        // Here you would call an API to save the quiz results
        // For now, we'll just log and return success
        console.log(`Saving quiz results for user ${userId}: ${score}/${totalQuestions} on ${topic}`);

        // Example payload for saving quiz results
        const payload = {
            userId,
            topic,
            score,
            totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            completedAt: new Date().toISOString()
        };

        // In a real app, you would send this payload to your backend
        console.log('Quiz result payload:', payload);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return true;
    } catch (error) {
        console.error('Failed to save quiz results:', error);
        return false;
    }
};

// Get quiz history
export const getQuizHistory = async (userId: string) => {
    // In a real app, this would be an API call to get quiz history
    // For now, we'll return mock data

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
        { id: 1, topic: 'React Native', score: '8/10', date: '2 days ago' },
        { id: 2, topic: 'JavaScript', score: '7/10', date: '1 week ago' },
        { id: 3, topic: 'CSS Grid & Flexbox', score: '9/10', date: '2 weeks ago' },
    ];
};

// Mock questions as fallback if API fails
const getMockQuestions = (topic: string, numberOfQuestions: number): QuizQuestion[] => {
    // Base questions for different topics (fallback data)
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

    // Get questions for the requested topic, or generate generic ones if topic not found
    const availableQuestions = questionsByTopic[topic] || [
        {
            id: 1,
            question: `What is a key concept in ${topic}?`,
            options: [
                'Concept A',
                'Concept B',
                'Concept C',
                'Concept D'
            ],
            correctAnswer: 'Concept A',
            explanation: `This is an explanation about a key concept in ${topic}.`
        },
        {
            id: 2,
            question: `Which of these is NOT related to ${topic}?`,
            options: [
                'Related item A',
                'Related item B',
                'Unrelated item',
                'Related item C'
            ],
            correctAnswer: 'Unrelated item',
            explanation: `This unrelated item is not part of ${topic}.`
        },
        {
            id: 3,
            question: `When was ${topic} first introduced?`,
            options: [
                'Before 1990',
                '1990-2000',
                '2000-2010',
                'After 2010'
            ],
            correctAnswer: '2000-2010',
            explanation: `${topic} was introduced during this time period.`
        }
    ];

    // Return the requested number of questions (or all available if fewer)
    return availableQuestions.slice(0, numberOfQuestions);
}; 