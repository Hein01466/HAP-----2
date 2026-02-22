import mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { User, UserSchema } from '../users/schemas/user.schema'
import { Role } from '../users/role.enum'

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hap'
  const email = (process.env.ADMIN_EMAIL || 'admin@local.test').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  await mongoose.connect(mongoUri)
  const UserModel = mongoose.model<User>('User', UserSchema)

  const existing = await UserModel.findOne({ email }).exec()
  if (existing) {
    console.log(`Admin user already exists: ${email}`)
    await mongoose.disconnect()
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  await UserModel.create({ email, password: hashed, role: Role.Admin })
  console.log(`Created admin user: ${email}`)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
