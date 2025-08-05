'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useToast,
  Spinner,
  IconButton,
  Flex,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  useColorMode,
  useColorModeValue,
  Textarea,
  Collapse,
  Icon,
  Tooltip,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react'
import {
  SearchIcon,
  CopyIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  WarningIcon,
  InfoIcon,
} from '@chakra-ui/icons'
import { FaMicrophone, FaMicrophoneSlash, FaCopy, FaShare, FaGlobe } from 'react-icons/fa'


interface Answer {
  text: string
  timestamp: string
}

export default function PolicyNavigatorAgent() {
  const [question, setQuestion] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [scrapedContent, setScrapedContent] = useState<any>(null)
  const [urlToScrape, setUrlToScrape] = useState('')
  const [isScraping, setIsScraping] = useState(false)
  const [copied, setCopied] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  

  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const toast = useToast()
  const { colorMode, toggleColorMode } = useColorMode()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const cardBg = useColorModeValue('white', 'gray.700')

  const handleQuestionSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: 'Please enter a question',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        throw new Error('Failed to get answer')
      }

      const data = await response.json()
      setAnswer(data)
      
      toast({
        title: 'Answer generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Failed to get answer',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

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
        setRecordingTime(0)
        
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 10) {
              stopRecording()
              return 0
            }
            return prev + 1
          })
        }, 1000)
        
        toast({
          title: 'Listening...',
          description: 'Speak your question now',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      }
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setQuestion(transcript)
        
        toast({
          title: 'Voice input transcribed',
          description: transcript,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        
        // Automatically submit the question after transcription
        setTimeout(() => {
          handleQuestionSubmit()
        }, 1000)
      }
      
      recognition.onerror = (event) => {
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
        setRecordingTime(0)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
      }
      
      recognition.onend = () => {
        setIsRecording(false)
        setRecordingTime(0)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
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

  const stopRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const handleCopyAnswer = async () => {
    if (answer) {
      try {
        await navigator.clipboard.writeText(answer.text)
        setCopied(true)
        toast({
          title: 'Answer copied to clipboard',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast({
          title: 'Failed to copy answer',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  const handleUrlScrape = async () => {
    if (!urlToScrape.trim()) {
      toast({
        title: 'Please enter a URL',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsScraping(true)
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToScrape }),
      })

      if (!response.ok) {
        throw new Error('Failed to scrape URL')
      }

      const data = await response.json()
      setScrapedContent(data)
      
      toast({
        title: 'Content scraped successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Failed to scrape URL',
        description: 'Please check the URL and try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsScraping(false)
    }
  }



  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Header */}
      <Box 
        bg={bgColor} 
        borderBottom="1px" 
        borderColor={borderColor}
        py={4}
        px={6}
        shadow="sm"
      >
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Box
                w="40px"
                h="40px"
                bg="brand.500"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
                fontSize="lg"
              >
                PNA
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="brand.600">
                  Policy Navigator Agent
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Your AI-powered privacy and compliance assistant
                </Text>
              </VStack>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleColorMode}
            >
              {colorMode === 'light' ? '🌙' : '☀️'}
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          
          {/* Question Input Section */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <VStack spacing={6}>
                <Heading size="md" textAlign="center" color="brand.600">
                  Ask Your Policy Question
                </Heading>
                
                {/* Text Input */}
                <Box w="full">
                  <HStack spacing={4}>
                    <Input
                      placeholder="Type your Policy question..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      size="lg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleQuestionSubmit()
                        }
                      }}
                    />
                    <Button
                      size="lg"
                      onClick={handleQuestionSubmit}
                      isLoading={isLoading}
                      loadingText="Asking..."
                      px={8}
                                         >
                       <Box as="span" mr={2}>
                         <SearchIcon />
                       </Box>
                       Ask
                     </Button>
                  </HStack>
                </Box>

                {/* Voice Input */}
                <Box w="full" textAlign="center">
                  <VStack spacing={3}>
                                         <Text fontSize="sm" color="gray.600">
                       🎤 Click to speak your question (will auto-submit)
                     </Text>
                    <HStack spacing={4}>
                      <IconButton
                        aria-label="Record voice input"
                        icon={isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                        size="lg"
                        colorScheme={isRecording ? 'red' : 'brand'}
                        onClick={isRecording ? stopRecording : startRecording}
                        isRound
                        animation={isRecording ? 'pulse 1s infinite' : undefined}
                      />
                      {isRecording && (
                        <Text fontSize="sm" color="red.500">
                          Recording... {10 - recordingTime}s
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Answer Section */}
          {isLoading && (
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={4}>
                  <Spinner size="lg" color="brand.500" />
                  <Text>Generating answer...</Text>
                  <SkeletonText noOfLines={4} spacing={4} />
                </VStack>
              </CardBody>
            </Card>
          )}

          {answer && (
            <Card bg={cardBg} shadow="md">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="brand.600">
                    Answer
                  </Heading>
                  <HStack spacing={2}>
                    <Tooltip label="Copy answer">
                      <IconButton
                        aria-label="Copy answer"
                        icon={copied ? <CheckIcon /> : <FaCopy />}
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyAnswer}
                        colorScheme={copied ? 'green' : 'gray'}
                      />
                    </Tooltip>
                    <Tooltip label="Share answer">
                      <IconButton
                        aria-label="Share answer"
                        icon={<FaShare />}
                        size="sm"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Text fontSize="lg" whiteSpace="pre-wrap">
                    {answer.text}
                  </Text>
                  
                  
                </VStack>
              </CardBody>
            </Card>
          )}

          

           {/* URL Scraping Section */}
           <Card bg={cardBg} shadow="md">
             <CardHeader>
               <Heading size="md" color="brand.600">
                 🌐 Enhanced URL Scraping Tool
               </Heading>
             </CardHeader>
             <CardBody>
               <VStack spacing={4}>
                 <Text fontSize="sm" color="gray.600" textAlign="center">
                   Enter any website URL to analyze and extract privacy policy information. The tool will automatically detect policy types and provide detailed analysis.
                 </Text>
                 
                 <HStack spacing={4} w="full">
                   <Input
                     placeholder="Enter website URL to scrape (e.g., https://gdpr-info.eu/art-5-gdpr/)"
                     value={urlToScrape}
                     onChange={(e) => setUrlToScrape(e.target.value)}
                     size="lg"
                   />
                   <Button
                     size="lg"
                     onClick={handleUrlScrape}
                     isLoading={isScraping}
                     loadingText="Scraping..."
                     px={8}
                   >
                     <Box as="span" mr={2}>
                       <FaGlobe />
                     </Box>
                     Scrape
                   </Button>
                 </HStack>

                 {scrapedContent && (
                   <Box w="full" mt={4}>
                     <Accordion allowToggle>
                       <AccordionItem>
                         <AccordionButton>
                           <Box flex="1" textAlign="left">
                             <VStack align="start" spacing={1}>
                               <HStack>
                                 <FaGlobe />
                                 <Text fontWeight="bold">{scrapedContent.title}</Text>
                                 <Badge colorScheme="green">Scraped</Badge>
                               </HStack>
                               {scrapedContent.metadata && (
                                 <HStack spacing={2} fontSize="xs" color="gray.600">
                                   {scrapedContent.metadata.policyType && (
                                     <Badge size="sm" colorScheme="blue">{scrapedContent.metadata.policyType}</Badge>
                                   )}
                                   {scrapedContent.metadata.jurisdiction && (
                                     <Badge size="sm" colorScheme="purple">{scrapedContent.metadata.jurisdiction}</Badge>
                                   )}
                                   <Text>{scrapedContent.metadata.wordCount} words</Text>
                                   <Text>{scrapedContent.metadata.sections} sections</Text>
                                 </HStack>
                               )}
                             </VStack>
                           </Box>
                           <AccordionIcon />
                         </AccordionButton>
                         <AccordionPanel>
                           <VStack spacing={4} align="stretch">
                             {scrapedContent.sections.map((section: any, index: number) => (
                               <Box key={index} p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                                 <Heading size="sm" mb={3} color="brand.600">
                                   {section.title}
                                 </Heading>
                                 <Text fontSize="sm" lineHeight="1.6" color="gray.700">
                                   {section.content}
                                 </Text>
                               </Box>
                             ))}
                             {scrapedContent.metadata && (
                               <Box p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                                 <Text fontSize="xs" color="blue.700" fontWeight="bold">
                                   Analysis Summary
                                 </Text>
                                 <Text fontSize="xs" color="blue.600" mt={1}>
                                   Scraped on {new Date(scrapedContent.metadata.scrapedAt).toLocaleString()}
                                   {scrapedContent.metadata.policyType && ` • Policy Type: ${scrapedContent.metadata.policyType}`}
                                   {scrapedContent.metadata.jurisdiction && ` • Jurisdiction: ${scrapedContent.metadata.jurisdiction}`}
                                 </Text>
                               </Box>
                             )}
                           </VStack>
                         </AccordionPanel>
                       </AccordionItem>
                     </Accordion>
                   </Box>
                 )}
               </VStack>
             </CardBody>
           </Card>
        </VStack>
      </Container>
    </Box>
  )
} 