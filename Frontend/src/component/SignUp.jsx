import React, { useState } from 'react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import axios from 'axios';
const hostUrl = import.meta.env.VITE_HOST_NAME;

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [signupError, setSignupError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    birthdate: '',
    gender: '',
    phone_number: '',
    role: '',
    security_question: '',
    security_answer: '',
    confirmation_token: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name) => (value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      console.log('Initial signup data:', formData);
      const response = await axios.post(hostUrl+"/auth/signUp",{formData});
      console.log(response);
      if(response!=null && response.data.statusCode ==200){
        setSignupError('');
        setStep(2);
      }else{
        setSignupError(response.data.body || 'An error occurred during signup. Please try again.');
        console.log('Error while sign Up');
      }
    } else {
      console.log('Final submission with confirmation-code:', formData);
      const response = await axios.post(hostUrl+"/auth/confirm-account",{email:formData.email,confirmation_code:formData.confirmation_token});
      if(response!=null){
          if(response.data.statusCode == 200){
            setVerificationStatus('success');
            setVerificationMessage('Your account has been successfully verified!');
          }else{
            setVerificationStatus('error');
            setVerificationMessage('Verification failed. Please check your token and try again.');
          }
      }
      console.log(response);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{step === 1 ? 'Sign Up' : 'Confirm Your Account'}</CardTitle>
        <CardDescription>
          {step === 1 ? 'Create a new account to get started.' : 'Enter the confirmation token sent to your email.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Gender</Label>
                <RadioGroup value={formData.gender} onValueChange={handleSelectChange('gender')} required>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleSelectChange('role')} required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="security_question">Security Question</Label>
                <Select value={formData.security_question} onValueChange={handleSelectChange('security_question')} required>
                  <SelectTrigger id="security_question">
                    <SelectValue placeholder="Select a security question" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="What was the name of your first pet?">What was the name of your first pet?</SelectItem>
                    <SelectItem value="In which city were you born?">In which city were you born?</SelectItem>
                    <SelectItem value="What is your mother's maiden name?">What is your mother's maiden name?</SelectItem>
                    <SelectItem value="What was the make of your first car?">What was the make of your first car?</SelectItem>
                    <SelectItem value="What is your favorite book?">What is your favorite book?</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="security_answer">Security Answer</Label>
                <Input
                  id="security_answer"
                  name="security_answer"
                  placeholder="Enter your answer"
                  value={formData.security_answer}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirmation_token">Confirmation Token</Label>
                <Input
                  id="confirmation_token"
                  name="confirmation_token"
                  placeholder="Enter the token sent to your email"
                  value={formData.confirmation_token}
                  onChange={handleChange}
                  required
                />
              </div>
              {verificationStatus !== 'idle' && (
                <Alert variant={verificationStatus === 'success' ? 'default' : 'destructive'}>
                  {verificationStatus === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {verificationStatus === 'success' ? 'Success' : 'Error'}
                  </AlertTitle>
                  <AlertDescription>{verificationMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <div className="flex flex-col space-y-4">
          <div className="flex justify-between">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            <Button type="submit" className={step === 1 ? 'w-full' : 'ml-auto'}>
              {step === 1 ? 'Sign Up' : 'Confirm Account'}
              {step === 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
          {step === 1 && signupError && (
              <Alert variant="destructive" className="mt-4">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{signupError}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account? <a href="/logIn" className="text-primary hover:underline">Log in</a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUp;