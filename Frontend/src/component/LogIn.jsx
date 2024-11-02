'use client'

import { useState, useReducer } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const hostUrl = import.meta.env.VITE_HOST_NAME;
let securityQuestion = ""
const validateCredentials = async (email, password) => {
  console.log(hostUrl);
  const response = await axios.post(hostUrl+"/auth/verifyCredentials",{username: email,password:password});
  if(response!=null){
    console.log(response.data);
    return response.data.statusCode === 200
  }
  console.log(response.data);
  return false;
}

const validateSecurityAnswer = async (email , answer) => {
    const response = await axios.post(hostUrl+"/auth/verify-security-answer",{email: email,answer:answer});
    if(response!=null){
    console.log(response.data);
    return response.data.statusCode === 200
    }
    console.log(response.data);
    return false;
}

const validateMathExpression = async (expression) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  try {
    return eval(expression) === 10
  } catch {
    return false
  }
}

const initialState = {
  email: '',
  password: '',
  securityAnswer: '',
  mathExpression: '',
  currentStep: 1,
  error: null
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload }
    case 'SET_PASSWORD':
      return { ...state, password: action.payload }
    case 'SET_SECURITY_ANSWER':
      return { ...state, securityAnswer: action.payload }
    case 'SET_MATH_EXPRESSION':
      return { ...state, mathExpression: action.payload }
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export default function LogIn() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isLoading, setIsLoading] = useState(false)
  let question = "";
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      switch (state.currentStep) {
        case 1:
          const credentialsValid = await validateCredentials(state.email, state.password)
          if (credentialsValid) {
            const userDetails = await axios.get(hostUrl+"/auth/user-detail",{params:{email:state.email}});
            console.log(userDetails)
            const parsedBody = JSON.parse(userDetails.data.body);
            securityQuestion = parsedBody.record.securityQuestion;
            console.log(securityQuestion); 
            dispatch({ type: 'NEXT_STEP' })
          } else {
            dispatch({ type: 'SET_ERROR', payload: 'Invalid email or password' })
          }
          break
        case 2:
          const securityAnswerValid = await validateSecurityAnswer(state.email,state.securityAnswer)
          if (securityAnswerValid) {
            dispatch({ type: 'NEXT_STEP' })
          } else {
            dispatch({ type: 'SET_ERROR', payload: 'Incorrect security answer' })
          }
          break
        case 3:
          const mathExpressionValid = await validateMathExpression(state.mathExpression)
          if (mathExpressionValid) {
            //Final Step to fetch the token
            const tokenReponse = await axios.post(hostUrl+"/auth/signIn",{username:state.email,password:state.password});
            if(tokenReponse!=null){
              console.log(tokenReponse);
              console.log('The Identity Token is:');
              const parsedBody = JSON.parse(tokenReponse.data.body);
              const identity_token = parsedBody.id_token;
              console.log(identity_token);
              localStorage.setItem('jwtToken', identity_token);
              localStorage.setItem('email', state.email);
              //Below gives the Role
              const role = parsedBody.role;
              console.log(role);
              localStorage.setItem('role',role);
              //ToDO :: Save the token in the Local Storage
            }
            dispatch({ type: 'NEXT_STEP' })
          } else {
            dispatch({ type: 'SET_ERROR', payload: 'Incorrect mathematical expression' })
          }
          break
      }
    } catch (error) {
      console.log(error);
      dispatch({ type: 'SET_ERROR', payload: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturnHome = () => {
    navigate('/');
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={state.email}
                onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={state.password}
                onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
                required
              />
            </div>
          </>
        )
      case 2:
        return (
          <div className="space-y-2">
            <Label htmlFor="security-question">{securityQuestion}</Label>
            <Input
              id="security-question"
              type="text"
              placeholder="Enter your answer"
              value={state.securityAnswer}
              onChange={(e) => dispatch({ type: 'SET_SECURITY_ANSWER', payload: e.target.value })}
              required
            />
          </div>
        )
      case 3:
        return (
          <div className="space-y-2">
            <Label htmlFor="math-expression">Enter a mathematical expression that evaluates to 10</Label>
            <Input
              id="math-expression"
              type="text"
              placeholder="e.g., 5 + 5"
              value={state.mathExpression}
              onChange={(e) => dispatch({ type: 'SET_MATH_EXPRESSION', payload: e.target.value })}
              required
            />
          </div>
        )
      case 4:
        return (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-xl font-semibold">Login Successful!</p>
            <p>Welcome back, {state.email}</p>
          </div>
        )
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Step {state.currentStep} of 3</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderStep()}
          {state.error && (
            <div className="flex items-center space-x-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{state.error}</p>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {state.currentStep < 4 && (
          <Button type="submit" className="w-full" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? 'Processing...' : 'Next'}
          </Button>
        )}
         <Button variant="outline" className="w-full" onClick={handleReturnHome}>
          <Home className="w-4 h-4 mr-2" />
          Return to Home
        </Button>
      </CardFooter>
      <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Dont have an account? <a href="signUp" className="text-primary hover:underline">Sign Up</a>
            </p>
          </CardFooter>
    </Card>
  )
}