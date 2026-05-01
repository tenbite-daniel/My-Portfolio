import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const MONGODB_URI = process.env.MONGODB_URI!

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true })

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q: string): Promise<string> => new Promise((res) => rl.question(q, res))

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  const existing = await Admin.findOne()
  if (existing) {
    const overwrite = await ask('⚠️  Admin already exists. Overwrite? (y/n): ')
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Aborted.')
      rl.close()
      await mongoose.disconnect()
      return
    }
    await Admin.deleteMany()
  }

  const email = await ask('Enter admin email: ')
  const password = await ask('Enter admin password: ')
  rl.close()

  const hashed = await bcrypt.hash(password, 12)
  await Admin.create({ email, password: hashed })

  console.log(`✅ Admin registered successfully with email: ${email}`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
