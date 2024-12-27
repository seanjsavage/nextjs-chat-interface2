'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, ArrowUp } from 'lucide-react'

const dialogue = {
  id: 'oil-check',
  title: 'Oil Level Check Guide',
  flow: [
    {
      id: 1,
      type: 'system',
      content: "How can I help you?"
    },
    {
      id: 2,
      type: 'user',
      content: "How do I check my oil level?"
    },
    {
      id: 3,
      type: 'system',
      content: "I'll guide you through checking your oil. First, make sure:\n- Car is parked on level ground\n- Engine is off and cooled (at least 10 minutes)\n- Have a clean lint-free cloth ready"
    },
    {
      id: 4,
      type: 'user',
      content: "Ok, ready"
    },
    {
      id: 5,
      type: 'system',
      content: "First, locate the oil dipstick:\n1. Open your hood\n2. Find the dipstick with an orange handle on the right (passenger) side\n3. It's easily accessible when facing the engine\n\n[Image: Finding the Dipstick]\n\nWould you like to continue with the next steps?"
    },
    {
      id: 6,
      type: 'user',
      content: "Yes, show me next steps"
    },
    {
      id: 7,
      type: 'system',
      content: "Here's how to check the oil level:\n1. Pull dipstick out and wipe clean with your cloth\n2. Insert it fully back in\n3. Pull it out again and check the oil level\n4. The dipstick has two marks - the top mark is 'MAX' or 'FULL' and the bottom mark is 'MIN' or 'LOW'\n5. Oil level should be between these marks, ideally closer to the top mark\n\nIf oil level is low:\n1. Locate the oil filler cap (black cap marked 'Engine Oil', about 6 inches behind dipstick)\n2. Add small amounts of SAE 0W-20 oil\n3. Recheck level with dipstick\n4. Stop when oil reaches proper level",
        suggestions: [
          { text: "Check warning lights", active: true },
          { text: "View rental car guide", active: true },
          { text: "Find a fuse", active: true },
          { text: "How to reset oil life monitor", active: false },
          { text: "Recommended oil change intervals", active: false },
          { text: "Oil filter location", active: false }
        ]
    }
  ]
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSystemThinking, setIsSystemThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, inputValue])

  useEffect(() => {
    if (dialogue.flow.length > 0) {
      setMessages([dialogue.flow[0]])
    }
  }, [])

  const simulateHumanTyping = async (text: string) => {
    const getRandomDelay = () => {
      return Math.random() * 70 + 28 // 28-98ms
    }

    const getPauseChance = (char: string) => {
      if (['.', ',', '?', '!'].includes(char)) return 0.5
      if ([' '].includes(char)) return 0.15
      return 0.03
    }

    const getPauseDuration = () => {
      return Math.random() * 280 + 140
    }

    await new Promise(resolve => setTimeout(resolve, Math.random() * 490 + 210))

    setIsTyping(true)
    setInputValue('')
    
    for (let i = 0; i < text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay()))
      setInputValue(text.slice(0, i + 1))
      
      if (Math.random() < getPauseChance(text[i])) {
        await new Promise(resolve => setTimeout(resolve, getPauseDuration()))
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 140))
    setIsTyping(false)
  }

  useEffect(() => {
    const typeNextMessage = async () => {
      if (currentMessageIndex >= dialogue.flow.length - 1) return
      
      const nextMessage = dialogue.flow[currentMessageIndex + 1]
      if (nextMessage?.type === 'user' && !isSystemThinking && !isTyping) {
        await simulateHumanTyping(nextMessage.content)
      }
    }

    typeNextMessage()
  }, [currentMessageIndex, isSystemThinking])

  const handleSend = async () => {
    if (currentMessageIndex >= dialogue.flow.length - 1) return

    const nextMessage = dialogue.flow[currentMessageIndex + 1]
    
    setMessages(prev => [...prev, nextMessage])
    setInputValue('')

    if (currentMessageIndex + 2 < dialogue.flow.length && 
        dialogue.flow[currentMessageIndex + 2].type === 'system') {
      setIsSystemThinking(true)
      
      await new Promise(resolve => 
        setTimeout(resolve, Math.random() * 500 + (Math.random() < 0.5 ? 400 : 600))
      )
      
      const systemMessage = dialogue.flow[currentMessageIndex + 2]
      const messageLength = systemMessage.content.length
      
      if (messageLength > 100) {
        const perCharDelay = Math.random() * 11 + 5.5
        const maxDelay = Math.random() * 1100 + 1650
        await new Promise(resolve => 
          setTimeout(resolve, Math.min(messageLength * perCharDelay, maxDelay))
        )
      } else {
        await new Promise(resolve => 
          setTimeout(resolve, Math.random() * 550 + 330)
        )
      }
      
      setMessages(prev => [...prev, systemMessage])
      setCurrentMessageIndex(prev => prev + 2)
      setIsSystemThinking(false)
    } else {
      setCurrentMessageIndex(prev => prev + 1)
    }
  }

  const renderSuggestions = (suggestions: any[]) => {
    if (!suggestions) return null

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            disabled={!suggestion.active}
            className={`
              px-4 py-2 rounded-full text-sm transition-colors
              ${suggestion.active 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="p-4 bg-blue-600 text-white flex items-center gap-2">
        <h1 className="text-lg font-semibold">{dialogue.title}</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div key={`${message.id}-${idx}`}>
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-lg p-3 max-w-[80%] whitespace-pre-wrap ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white shadow'
                }`}
              >
                {message.content}
              </div>
            </div>
            {message.suggestions && (
              <div className="mt-4 ml-3">
                <div className="text-sm text-gray-500 mb-2">You might also be interested in:</div>
                {renderSuggestions(message.suggestions)}
              </div>
            )}
          </div>
        ))}
        
        {isSystemThinking && (
          <div className="flex justify-start">
            <div className="rounded-lg p-2 bg-white shadow flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4 bg-white">
        <div className="relative">
          <input
            type="text"
            className="w-full p-3 pr-16 border rounded-lg bg-gray-50"
            placeholder={isTyping ? "Typing..." : "Type your message..."}
            value={inputValue}
            readOnly
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !inputValue || isSystemThinking}
            className={`absolute right-1 top-1 bottom-1 px-3 rounded bg-blue-600 text-white disabled:bg-gray-400`}
          >
            {isTyping || isSystemThinking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

