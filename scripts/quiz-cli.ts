#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { QuizImporter } from '../src/lib/services/quiz-importer'

const importer = new QuizImporter()

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'import':
      await handleImport(args[1])
      break
    case 'list':
      await handleList()
      break
    case 'export':
      await handleExport(args[1], args[2])
      break
    case 'validate':
      await handleValidate(args[1])
      break
    default:
      showHelp()
  }
}

async function handleImport(filePath?: string) {
  if (!filePath) {
    console.error('❌ Error: File path is required')
    console.log('Usage: npm run quiz:import <file-path>')
    process.exit(1)
  }

  try {
    const fullPath = resolve(filePath)
    console.log(`📂 Reading quiz file: ${fullPath}`)
    
    const jsonData = readFileSync(fullPath, 'utf-8')
    console.log('✅ File read successfully')
    
    console.log('🔍 Validating and importing quiz...')
    const result = await importer.importQuiz(jsonData)
    
    if (result.success) {
      console.log(`🎉 ${result.message}`)
      console.log(`📋 Quiz ID: ${result.quizId}`)
    } else {
      console.error(`❌ Import failed: ${result.message}`)
      if (result.errors) {
        console.error('Validation errors:')
        result.errors.forEach(error => console.error(`  • ${error}`))
      }
      process.exit(1)
    }
  } catch (error) {
    console.error(`❌ Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    process.exit(1)
  }
}

async function handleList() {
  try {
    console.log('📚 Fetching quiz list...')
    const quizzes = await importer.listQuizzes()
    
    if (quizzes.length === 0) {
      console.log('📝 No quizzes found. Import some quizzes first!')
      return
    }
    
    console.log(`\n📋 Found ${quizzes.length} quiz(es):\n`)
    console.log('ID'.padEnd(12) + 'Title'.padEnd(40) + 'Questions'.padEnd(12) + 'Created')
    console.log('─'.repeat(80))
    
    quizzes.forEach(quiz => {
      const id = quiz.id.substring(0, 10) + '...'
      const title = quiz.title.length > 35 ? quiz.title.substring(0, 32) + '...' : quiz.title
      const questions = quiz.questionCount.toString()
      const created = quiz.createdAt.toLocaleDateString()
      
      console.log(
        id.padEnd(12) + 
        title.padEnd(40) + 
        questions.padEnd(12) + 
        created
      )
    })
  } catch (error) {
    console.error(`❌ Failed to list quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    process.exit(1)
  }
}

async function handleExport(quizId?: string, outputPath?: string) {
  if (!quizId) {
    console.error('❌ Error: Quiz ID is required')
    console.log('Usage: npm run quiz:export <quiz-id> [output-file]')
    process.exit(1)
  }

  try {
    console.log(`📤 Exporting quiz: ${quizId}`)
    const quiz = await importer.exportQuiz(quizId)
    
    if (!quiz) {
      console.error(`❌ Quiz not found: ${quizId}`)
      process.exit(1)
    }
    
    const jsonData = JSON.stringify(quiz, null, 2)
    
    if (outputPath) {
      const fullPath = resolve(outputPath)
      writeFileSync(fullPath, jsonData, 'utf-8')
      console.log(`✅ Quiz exported to: ${fullPath}`)
    } else {
      console.log('\n📄 Quiz JSON:')
      console.log(jsonData)
    }
  } catch (error) {
    console.error(`❌ Failed to export quiz: ${error instanceof Error ? error.message : 'Unknown error'}`)
    process.exit(1)
  }
}

async function handleValidate(filePath?: string) {
  if (!filePath) {
    console.error('❌ Error: File path is required')
    console.log('Usage: npm run quiz:validate <file-path>')
    process.exit(1)
  }

  try {
    const fullPath = resolve(filePath)
    console.log(`🔍 Validating quiz file: ${fullPath}`)
    
    const jsonData = readFileSync(fullPath, 'utf-8')
    
    // Parse JSON
    let parsedData: unknown
    try {
      parsedData = JSON.parse(jsonData)
    } catch (error) {
      console.error(`❌ Invalid JSON format: ${error instanceof Error ? error.message : 'JSON parsing failed'}`)
      process.exit(1)
    }

    // Import the validator directly to avoid database connection
    const { QuizValidator } = await import('../src/lib/services/quiz-validator')
    const validator = new QuizValidator()
    
    if (validator.validate(parsedData)) {
      const quiz = parsedData as any
      console.log('✅ Quiz validation passed!')
      console.log(`📊 Quiz: "${quiz.quiz_title}" with ${quiz.questions.length} questions`)
    } else {
      console.error('❌ Validation failed')
      console.error('Validation errors:')
      validator.getErrors().forEach(error => console.error(`  • ${error.field}: ${error.message}`))
      process.exit(1)
    }
  } catch (error) {
    console.error(`❌ Failed to validate file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
🎯 Quiz CLI Tool

Usage:
  npm run quiz:import <file-path>     Import a quiz from JSON file
  npm run quiz:list                   List all imported quizzes
  npm run quiz:export <quiz-id> [file] Export quiz to JSON (stdout if no file)
  npm run quiz:validate <file-path>   Validate quiz JSON without importing

Examples:
  npm run quiz:import ./data/prompting-basics.json
  npm run quiz:list
  npm run quiz:export clr1a2b3c4d5 ./exported-quiz.json
  npm run quiz:validate ./data/new-quiz.json
`)
}

main().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})