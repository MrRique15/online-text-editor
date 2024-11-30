// encryption.js
import crypto from 'crypto'
import { config } from '@/utils/config'

const { secret_key, secret_iv, ecnryption_method } = config

if (!secret_key || !secret_iv || !ecnryption_method) {
  throw new Error('secretKey, secretIV, and ecnryptionMethod are required')
}

const key = crypto
  .createHash('sha512')
  .update(secret_key)
  .digest('hex')
  .substring(0, 32)

function create_secret_iv(input: string): string {
  return crypto.createHash('sha512').update(input).digest('hex').substring(0, 16)
}

export function aes_encryptData(data: string, custom_iv?: string): string {
  const cipher = crypto.createCipheriv(
    ecnryption_method, key, 
    create_secret_iv(custom_iv || secret_iv)
  )
  return Buffer.from(
    cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
  ).toString('base64')
}

export function aes_decryptData(encryptedData: string, custom_iv?: string): string {
  const buff = Buffer.from(encryptedData, 'base64')
  const decipher = crypto.createDecipheriv(
    ecnryption_method, key, 
    create_secret_iv(custom_iv || secret_iv)
  )
  return (
    decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
    decipher.final('utf8')
  )
}

export function sha256_encryptData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}