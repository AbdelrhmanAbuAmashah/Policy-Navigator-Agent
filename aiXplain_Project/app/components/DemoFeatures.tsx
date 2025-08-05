'use client'

import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { 
  FaMicrophone, 
  FaSearch, 
  FaCopy, 
  FaGlobe, 
  FaFileAlt,
  FaShieldAlt,
  FaMobile,
  FaDesktop
} from 'react-icons/fa'

const features = [
  {
    icon: FaSearch,
    title: 'Text Input',
    description: 'Type your policy questions with intelligent auto-completion'
  },
  {
    icon: FaMicrophone,
    title: 'Voice Input',
    description: 'Record questions with up to 10-second audio recording'
  },
  {
    icon: FaFileAlt,
    title: 'AI Answers',
    description: 'Get intelligent responses based on comprehensive policy data'
  },
  {
    icon: FaCopy,
    title: 'Copy & Share',
    description: 'Easily copy answers and share with your team'
  },
  {
    icon: FaGlobe,
    title: 'URL Scraping',
    description: 'Extract and analyze privacy policies from any website'
  },
  {
    icon: FaShieldAlt,
    title: 'Source Verification',
    description: 'View confidence scores and source documents'
  },
  {
    icon: FaMobile,
    title: 'Mobile Responsive',
    description: 'Works seamlessly on all devices and screen sizes'
  },
  {
    icon: FaDesktop,
    title: 'Dark/Light Mode',
    description: 'Toggle between themes for optimal viewing experience'
  }
]

export default function DemoFeatures() {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  return (
    <Box py={8}>
      <VStack spacing={8}>
        <Heading size="lg" textAlign="center" color="brand.600">
          Key Features
        </Heading>
        
        <Box
          display="grid"
          gridTemplateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)'
          }}
          gap={6}
          w="full"
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              p={6}
              bg={bgColor}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
              textAlign="center"
              transition="all 0.2s"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
                borderColor: 'brand.300'
              }}
            >
              <VStack spacing={4}>
                <Box
                  p={3}
                  bg="brand.50"
                  borderRadius="full"
                  color="brand.600"
                >
                  <Icon as={feature.icon} boxSize={6} />
                </Box>
                <VStack spacing={2}>
                  <Heading size="sm" color="brand.600">
                    {feature.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    {feature.description}
                  </Text>
                </VStack>
              </VStack>
            </Box>
          ))}
        </Box>
      </VStack>
    </Box>
  )
} 