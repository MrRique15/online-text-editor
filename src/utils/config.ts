export const config = {
    env: process.env.NODE_ENV || 'dev',
    secret_iv: process.env.SECRET_IV || 'default_secret_iv',
    secret_key: process.env.SECRET_KEY || 'default_secret_key',
    mongo_database: process.env.DATABASE_NAME || 'default_database',
    mongo_uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    ecnryption_method: process.env.ECNRYPTION_METHOD || 'aes-256-cbc',
    mongo_text_collection: process.env.TEXT_COLLECTION || 'default_collection',
}