
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";

/**
 * BACKEND INTEGRATION NOTE:
 * - This component can be integrated with Spring Boot backend through API calls
 * - Create a ChatMessage endpoint in your Spring Boot application
 * - Use WebSocket for real-time chat functionality if needed
 * - Consider implementing AI-powered responses with a language model API
 */

// Message types for chat
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Initial welcome messages from the bot
const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Welcome to Cloud Jet Airways! I\'m your virtual assistant. How can I help you today?',
    sender: 'bot',
    timestamp: new Date(),
  },
];

// Quick reply options for common questions
const quickReplies = [
  "How do I book a flight?",
  "What's your baggage policy?",
  "How can I check flight status?",
  "How do cancellations work?",
  "Tell me about your airline"
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle chat visibility
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  /**
   * BACKEND INTEGRATION NOTE:
   * - Replace with API call to backend chatbot service
   * - POST request to /api/chat with user message
   * - Handle response from backend chatbot
   * - Consider implementing typing indicator while waiting for response
   * 
   * @param userMessage User's message to process
   */
  const processMessage = async (userMessage: string) => {
    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      // Generate bot response based on user message
      const botResponse = generateBotResponse(userMessage);
      
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    processMessage(input.trim());
  };

  // Handle clicking on a quick reply button
  const handleQuickReply = (reply: string) => {
    processMessage(reply);
  };

  /**
   * BACKEND INTEGRATION NOTE:
   * - Replace with actual backend chatbot response
   * - Integrate with Spring Boot NLP service or external AI API
   * - Store conversation history in database for continuity
   * 
   * @param message User message to respond to
   * @returns Bot response message
   */
  const generateBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Basic response logic - replace with more sophisticated backend integration
    if (lowerMessage.includes('book') || lowerMessage.includes('reservation')) {
      return "To book a flight, you can use our booking page. Select your origin, destination, dates, and passenger information. We offer various payment methods including credit cards and wallet balance.";
    } else if (lowerMessage.includes('baggage') || lowerMessage.includes('luggage')) {
      return "Our baggage policy allows one carry-on bag (max 7kg) and one checked bag (max 23kg) per passenger. Additional baggage can be purchased during booking or at the airport.";
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
      return "When you cancel a booking, the refund is automatically processed to your wallet. The refund amount depends on how far in advance you cancel. You can view all refunds in your wallet transaction history.";
    } else if (lowerMessage.includes('flight status') || lowerMessage.includes('delayed')) {
      return "You can check your flight status on our dashboard under the Flights section. We also send notifications via email and SMS about any changes to your flight schedule.";
    } else if (lowerMessage.includes('about') || lowerMessage.includes('airline')) {
      return "Cloud Jet Airways is a premier airline offering domestic and international flights with exceptional service. We prioritize customer satisfaction, on-time performance, and competitive pricing. Our modern fleet ensures comfort and safety on every journey.";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! Welcome to Cloud Jet Airways. How can I assist you with your travel plans today?";
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else {
      return "I'm not sure I understand. Would you like information about booking flights, checking flight status, our baggage policy, or cancellation process?";
    }
  };
  
  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          className="h-14 w-14 rounded-full bg-airline-blue hover:bg-airline-navy shadow-lg"
          onClick={toggleChat}
        >
          <MessageCircle size={24} />
        </Button>
      </div>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm">
          <Card className="border shadow-lg">
            <CardHeader className="bg-airline-blue text-white">
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  <span>Cloud Jet Support</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-white hover:bg-airline-navy hover:text-white"
                  onClick={toggleChat}
                >
                  <span className="sr-only">Close</span>
                  <span>✕</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px] p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender === 'user' 
                            ? 'bg-airline-blue text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-right mt-1 opacity-70">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Quick Replies */}
              <div className="px-4 py-2 border-t overflow-x-auto whitespace-nowrap">
                <div className="flex gap-2">
                  {quickReplies.map((reply) => (
                    <Button
                      key={reply}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
