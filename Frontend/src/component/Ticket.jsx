'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Plus, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLoaderData } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

export default function Component() {
    
  const navigate = useNavigate();
  const mockChats = useLoaderData();
  console.log('mockchats are::');
  console.log(mockChats)
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [newReferenceCode, setNewReferenceCode] = useState('')
  const [newSupportMessage, setNewSupportMessage] = useState('')
  const [newSupportStatus, setNewSupportStatus] = useState(null)
  const [userRole, setUserRole] = useState('')
  const scrollAreaRef = useRef(null)
  
  useEffect(() => {
    if(localStorage.getItem('jwtToken')==null){
        navigate('/login')
    }
    const role = localStorage.getItem('role') || ''
    setUserRole(role)
  }, [])

  const handleChatSelect = async (chatId) => {
    console.log('The referenceId selected is:')
    console.log(chatId);
    setSelectedChat(chatId)
    const referenceCodeMsgs = await axios.post('https://1z7rwk13kl.execute-api.us-east-1.amazonaws.com/Dev/get-resource-chat',{referenceCode:chatId},
        {headers:{
            'Authorization': localStorage.getItem('jwtToken')
        }}
    )
    console.log('The data is::')
    console.log(JSON.parse(referenceCodeMsgs.data.body));
    setMessages(JSON.parse(referenceCodeMsgs.data.body))
    const email = localStorage.getItem('email');
    const socket = new WebSocket(`wss://yo1to9o3v4.execute-api.us-east-1.amazonaws.com/production?userId=${email}`);
        //Main Web-socket logic
        socket.onopen = () => {
          console.log('WebSocket connection opened');
        };
      
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log(event);
          console.log(message);
          //Filtering based on the reference Code
          if (message.action === 'newMessage' && message.data.referenceCode==chatId) {
            setMessages((prevMessages) => [...prevMessages, message.data]);
          }
          console.log(event)
        };
  }

  const handleNewReferenceCodeSubmit = async (e) => {
    e.preventDefault()
    if (newReferenceCode.trim() === '' || newSupportMessage.trim() === ''){
        setNewSupportStatus({ success: false, message: 'Please fill in both Reference Code and Message fields.' })
        return
    }
    try{
        const newSupportRequestResponse = await axios.post('https://us-central1-cloudfunctiontest-437414.cloudfunctions.net/function-4',{message:newSupportMessage,referenceCode:newReferenceCode},
            {headers:{
                Authorization: localStorage.getItem('jwtToken')
            }}
        );
        console.log(newSupportRequestResponse);
        setNewReferenceCode('')
        setNewSupportMessage('')
        if(newSupportRequestResponse.status == 200){
            setNewSupportStatus({ success: true, message: 'Successfully submitted your support.' })
        }
    }catch(error){
        console.log('Error occurred')
        console.log(error);
        if(error.status==400){
            setNewSupportStatus({ success: false, message: error.response.data})            
        }else{
            setNewSupportStatus({ success: false, message: 'Sorry for inconvenience but support unavailable at the moment. Try again after sometime.' })
        }
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (newMessage.trim() === '') return

    const updatedMessages = [
      ...messages,
      { id: messages.length + 1, message: newMessage, senderId: localStorage.getItem('email') ,timestamp:Date.now()},
    ]
    setMessages(updatedMessages)
    setNewMessage('')
    const response = await axios.post('https://1z7rwk13kl.execute-api.us-east-1.amazonaws.com/Dev/send-support-msg',{referenceCode:selectedChat,message:newMessage},
        {headers:{
            Authorization: localStorage.getItem('jwtToken')
        }}
    )
    console.log(response.body)
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      {selectedChat === null ? (
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Your Support Requests</h1>
            <ScrollArea className="h-[calc(100vh-200px)]">
              {mockChats.map((chat) => (
                <div
                  key={chat}
                  className="p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleChatSelect(chat)}
                >
                  <h2 className="font-semibold">Reference: {chat}</h2>
                  <p className="text-sm text-muted-foreground">{chat}</p>
                </div>
              ))}
            </ScrollArea>
            <div className="mt-4">
              {userRole === 'admin'?(<div></div>):(
                <form onSubmit={handleNewReferenceCodeSubmit} className="space-y-2">
                <h2 className="text-xl font-semibold mb-2">Start a Support Request</h2>
                <Input
                  type="text"
                  placeholder="Enter Reference Code "
                  value={newReferenceCode}
                  onChange={(e) => setNewReferenceCode(e.target.value)}
                  className="w-full"
                />
                <Textarea
                  placeholder="Enter your message"
                  value={newSupportMessage}
                  onChange={(e) => setNewSupportMessage(e.target.value)}
                  className="w-full"
                  rows={3}
                />
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Ticket
                </Button>
              </form>
              )}
              
              {newSupportStatus && (
                <Alert variant={newSupportStatus.success ? "default" : "destructive"} className="mt-2">
                  <AlertDescription className="flex items-center">
                    {newSupportStatus.success ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    {newSupportStatus.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col h-full">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">
                Support {mockChats.find((chat) => chat.id === selectedChat)?.referenceCode}
              </h1>
              <Button variant="ghost" onClick={() => setSelectedChat(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Tickets
              </Button>
            </div>
            <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.timestamp}
                    className={`p-3 rounded-lg ${
                      message.senderId === localStorage.getItem('email') ? 'bg-gray-400 text-primary-foreground ml-auto' : 'bg-slate-100'
                    } max-w-[80%] whitespace-pre-wrap break-words`}
                  >
                    {message.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <Button type="submit" className="self-end">
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const supportInfoLoader = async () => {
    const token = localStorage.getItem('jwtToken');
    if(token){
        const response = await axios.get('https://1z7rwk13kl.execute-api.us-east-1.amazonaws.com/Dev/support-tickets',
            {headers:{
                'Authorization': `${token}`
            }})
        return JSON.parse(response.data.body);
    }
    return [];
}