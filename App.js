import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const Stack = createStackNavigator();


const quizData = [
  {
    "prompt": "Which of the following is a track in the UCF digital media BA?",
    "type": "multiple-choice",
    "choices": [
      "Web Design", 
      "Game Design", 
      "Both web design and game design", 
      "None of the above"
    ],
    "correct": 2 // "Both web design and game design"
  },
  {
    "prompt": "Which of the following are UCF's school colors? (Select all that apply)",
    "type": "multiple-answer",
    "choices": [
      "Green", 
      "Black", 
      "Blue", 
      "Gold"
    ],
    "correct": [1, 3] // Black and Gold
  },
  {
    "prompt": "True or False: The sky is blue",
    "type": "true-false",
    "choices": [
      "True", 
      "False"
    ],
    "correct": 0 // True
  }
];


export default function App() {
  const [userAnswers, setUserAnswers] = useState(Array(quizData.length).fill(null));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

 
  const handleAnswer = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
    
      return true; 
    }
    return false; 
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Question" 
          options={{ 
            title: "Quiz", 
            headerLeft: () => null,
            gestureEnabled: false,]
          }}
        >
          {props => (
            <QuestionScreen
              {...props}
              questionData={quizData[currentQuestionIndex]}
              questionIndex={currentQuestionIndex}
              totalQuestions={quizData.length}
              onAnswer={handleAnswer}
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="Summary" 
          options={{
            title: "Quiz Results",
            headerLeft: () => null,
            gestureEnabled: false, 
          }}
        >
          {props => (
            <Summary
              {...props}
              quizData={quizData}
              userAnswers={userAnswers}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export function QuestionScreen({ questionData, questionIndex, totalQuestions, onAnswer, navigation }) {
  
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  const [selectedIndices, setSelectedIndices] = useState([]);
  
  const handleNextQuestion = () => {
    const answer = questionData.type === "multiple-answer" ? selectedIndices : selectedIndex;
    const goToSummary = onAnswer(answer);
    if (goToSummary) {
      navigation.navigate('Summary');
    }
  };
  const toggleMultipleAnswerChoice = (idx) => {
    setSelectedIndices((prevSelected) => {
      if (prevSelected.includes(idx)) {
        return prevSelected.filter((i) => i !== idx);
      } else {
        return [...prevSelected, idx];
      }
    });
  };
  const renderChoices = () => {
    if (questionData.type === "multiple-answer") {
      return (
        <View testID="choices" style={styles.choicesContainer}>
          {questionData.choices.map((choice, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.choiceButton,
                selectedIndices.includes(idx) ? styles.selectedChoice : {}
              ]}
              onPress={() => toggleMultipleAnswerChoice(idx)}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    } else {
      return (
        <View testID="choices" style={styles.choicesContainer}>
          {questionData.choices.map((choice, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.choiceButton,
                selectedIndex === idx ? styles.selectedChoice : {}
              ]}
              onPress={() => setSelectedIndex(idx)}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.questionCount}>Question {questionIndex + 1} of {totalQuestions}</Text>
        <Text style={styles.questionText}>{questionData.prompt}</Text>
        
        {renderChoices()}
        
        <TouchableOpacity
          testID="next-question"
          style={[
            styles.nextButton,
            ((questionData.type === "multiple-answer" && selectedIndices.length === 0) || 
             (questionData.type !== "multiple-answer" && selectedIndex === null)) 
              ? styles.disabledButton 
              : {}
          ]}
          onPress={handleNextQuestion}
          disabled={(questionData.type === "multiple-answer" && selectedIndices.length === 0) || 
                   (questionData.type !== "multiple-answer" && selectedIndex === null)}
        >
          <Text style={styles.buttonText}>
            {questionIndex < totalQuestions - 1 ? "Next Question" : "See Results"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


export function Summary({ quizData, userAnswers }) {
  const calculateScore = () => {
    let score = 0;
    
    for (let i = 0; i < quizData.length; i++) {
      const question = quizData[i];
      const userAnswer = userAnswers[i];
      
      if (question.type === "multiple-answer") {
       
        const correct = question.correct;
        if (
          userAnswer && 
          userAnswer.length === correct.length &&
          userAnswer.every(val => correct.includes(val)) &&
          correct.every(val => userAnswer.includes(val))
        ) {
          score++;
        }
      } else {
        
        if (userAnswer === question.correct) {
          score++;
        }
      }
    }
    
    return score;
  };
  
  const renderAnswerChoice = (choice, index, questionIndex) => {
    const question = quizData[questionIndex];
    const userAnswer = userAnswers[questionIndex];
    
    let textStyle = styles.normalText;
    
    if (question.type === "multiple-answer") {
     
      const isSelected = userAnswer && userAnswer.includes(index);
      const isCorrectAnswer = question.correct.includes(index);
      
      if (isCorrectAnswer) {
        textStyle = styles.correctAnswer;
      } else if (isSelected) {
        textStyle = styles.incorrectAnswer;
      }
    } else {
     
      const isCorrectAnswer = index === question.correct;
      const isUserAnswer = index === userAnswer;
      
      if (isCorrectAnswer) {
        textStyle = styles.correctAnswer;
      } else if (isUserAnswer) {
        textStyle = styles.incorrectAnswer;
      }
    }
    
    return (
      <Text key={index} style={textStyle}>
        {choice}
      </Text>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Quiz Summary</Text>
        <Text testID="total" style={styles.score}>
          Your Score: {calculateScore()} out of {quizData.length}
        </Text>
        
        {quizData.map((question, questionIndex) => (
          <View key={questionIndex} style={styles.summaryItem}>
            <Text style={styles.questionText}>
              {questionIndex + 1}. {question.prompt}
            </Text>
            <View style={styles.answersContainer}>
              {question.choices.map((choice, choiceIndex) => 
                renderAnswerChoice(choice, choiceIndex, questionIndex)
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Basic layout
  container: {
    flex: 1,
    
  },
  contentContainer: {
    padding: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  questionCount: {
    fontSize: 16,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  choiceText: {
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  choicesContainer: {
    marginBottom: 15,
    width: '100%',
  },
  choiceButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 5,
    marginBottom: 8,
  },
  
  selectedChoice: {
    backgroundColor: '#24a0ed',
  },
  
  
  nextButton: {
    backgroundColor: '#4a86e8',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  summaryItem: {
    marginBottom: 15,
    
  },
  answersContainer: {
    marginTop: 8,
  },
  normalText: {
    fontSize: 16,
    marginBottom: 6,
    padding: 8,
  },
  correctAnswer: {
    fontSize: 16,
    marginBottom: 6,
    color: '#2e7d32',
    padding: 8,
    borderRadius: 4,
  },
  incorrectAnswer: {
    fontSize: 16,
    marginBottom: 6,
    color: '#c62828',
    textDecorationLine: 'none',
    padding: 8,
    borderRadius: 4,
  },
});

