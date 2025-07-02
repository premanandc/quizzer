#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔒 Running Security Audit for Quizzer Application')
console.log('='.repeat(50))

let hasSecurityIssues = false

// 1. Check for vulnerable dependencies
console.log('\n📦 Checking for vulnerable dependencies...')
try {
  execSync('npm audit --audit-level=moderate', { stdio: 'inherit' })
  console.log('✅ No vulnerable dependencies found')
} catch {
  console.log('❌ Vulnerable dependencies detected!')
  hasSecurityIssues = true
}

// 2. Run security linting
console.log('\n🔍 Running security-focused ESLint rules...')
try {
  execSync('npm run security:lint', { stdio: 'inherit' })
  console.log('✅ No security issues found in code')
} catch {
  console.log('❌ Security issues detected in code!')
  hasSecurityIssues = true
}

// 3. Check for hardcoded secrets
console.log('\n🔑 Scanning for hardcoded secrets...')
const secretPatterns = [
  /password\s*=\s*['"][^'"]+['"]/gi,
  /secret\s*=\s*['"][^'"]+['"]/gi,
  /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
  /token\s*=\s*['"][^'"]+['"]/gi,
  /jwt[_-]?secret\s*=\s*['"][^'"]+['"]/gi,
]

function scanFile(filePath) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = fs.readFileSync(filePath, 'utf8')
  const issues = []

  secretPatterns.forEach((pattern) => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach((match) => {
        // Skip test files and obvious test values
        if (
          !filePath.includes('test') &&
          !match.includes('test') &&
          !match.includes('example') &&
          !match.includes('[REDACTED]')
        ) {
          issues.push(`Potential secret in ${filePath}: ${match}`)
        }
      })
    }
  })

  return issues
}

function scanDirectory(dir) {
  const issues = []
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const stat = fs.statSync(filePath)

    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      issues.push(...scanDirectory(filePath))
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.js') ||
      file.endsWith('.jsx')
    ) {
      issues.push(...scanFile(filePath))
    }
  })

  return issues
}

const secretIssues = scanDirectory('./src')
if (secretIssues.length > 0) {
  console.log('❌ Potential hardcoded secrets found:')
  secretIssues.forEach((issue) => console.log(`  ${issue}`))
  hasSecurityIssues = true
} else {
  console.log('✅ No hardcoded secrets detected')
}

// 4. Check environment variable security
console.log('\n🌍 Checking environment variable security...')
const envExample = path.join('.', '.env.example')

if (!fs.existsSync(envExample)) {
  console.log(
    '⚠️  No .env.example file found - consider creating one for documentation'
  )
}

if (fs.existsSync('.env')) {
  console.log("⚠️  .env file detected - ensure it's in .gitignore")

  const gitignore = fs.readFileSync('.gitignore', 'utf8')
  if (!gitignore.includes('.env')) {
    console.log('❌ .env not in .gitignore - potential security risk!')
    hasSecurityIssues = true
  } else {
    console.log('✅ .env properly excluded from git')
  }
}

// 5. Check for secure headers and configurations
console.log('\n🛡️  Checking security configurations...')

// Check if Next.js security headers are configured
const nextConfig = path.join('.', 'next.config.ts')
if (fs.existsSync(nextConfig)) {
  const config = fs.readFileSync(nextConfig, 'utf8')

  const securityFeatures = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'X-DNS-Prefetch-Control',
  ]

  let hasSecurityHeaders = false
  securityFeatures.forEach((header) => {
    if (config.includes(header)) {
      hasSecurityHeaders = true
    }
  })

  if (hasSecurityHeaders) {
    console.log('✅ Security headers configured')
  } else {
    console.log('⚠️  Consider adding security headers to next.config.ts')
  }
} else {
  console.log('⚠️  No next.config.ts found')
}

// 6. Run security tests
console.log('\n🧪 Running security tests...')
try {
  execSync('npm test -- src/__tests__/security --run', { stdio: 'inherit' })
  console.log('✅ All security tests passed')
} catch {
  console.log('❌ Security tests failed!')
  hasSecurityIssues = true
}

// Summary
console.log('\n' + '='.repeat(50))
if (hasSecurityIssues) {
  console.log('❌ Security audit completed with issues')
  console.log(
    'Please review and fix the security issues above before deploying.'
  )
  process.exit(1)
} else {
  console.log('✅ Security audit completed successfully')
  console.log('No critical security issues detected.')
  process.exit(0)
}
