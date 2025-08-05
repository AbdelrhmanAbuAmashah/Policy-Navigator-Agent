'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Heading,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'

export default function TestPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const toast = useToast()

  const startRecording = async () => {
    try {
      // Check if SpeechRecognition is available
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: 'Speech recognition not supported',
          description: 'Your browser does not support speech recognition',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsRecording(true)
        setTranscript('')
        toast({
          title: 'Listening...',
          description: 'Speak your question now',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      }
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        
        toast({
          title: 'Voice input transcribed',
          description: transcript,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        let errorMessage = 'Speech recognition failed'
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'Microphone access denied. Please allow microphone access.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.'
            break
          default:
            errorMessage = 'Speech recognition failed. Please try again.'
        }
        
        toast({
          title: 'Speech recognition error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        
        setIsRecording(false)
      }
      
      recognition.onend = () => {
        setIsRecording(false)
      }
      
      // Start recognition
      recognition.start()
      
    } catch (error) {
      console.error('Speech recognition error:', error)
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to use voice input',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8}>
        <Heading>Voice Recognition Test</Heading>
        
        <Card w="full">
          <CardBody>
            <VStack spacing={6}>
              <Text fontSize="lg">
                Click the microphone button and speak your question to test voice recognition.
              </Text>
              
              <HStack spacing={4}>
                <Button
                  size="lg"
                  colorScheme={isRecording ? 'red' : 'brand'}
                  onClick={startRecording}
                  isRound
                  animation={isRecording ? 'pulse 1s infinite' : undefined}
                >
                  {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </Button>
                
                {isRecording && (
                  <Text color="red.500" fontWeight="bold">
                    Recording... Speak now!
                  </Text>
                )}
              </HStack>
              
              {transcript && (
                <Box w="full" p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" mb={2}>Transcribed Text:</Text>
                  <Text>{transcript}</Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 