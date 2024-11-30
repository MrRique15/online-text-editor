import { MongoClient, ServerApiVersion } from 'mongodb'
import { config } from '@/utils/config'

if (!config.mongo_uri) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"')
}

const uri = config.mongo_uri
const options = {
    serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
}

let client
let clientPromise: Promise<MongoClient>

if (config.env === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise