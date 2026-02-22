import mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { User, UserSchema } from '../users/schemas/user.schema'
import { Role } from '../users/role.enum'
import { Department, DepartmentSchema } from '../departments/schemas/department.schema'
import { Setting, SettingSchema } from '../settings/schemas/setting.schema'

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hap'
  const adminEmail = (process.env.ADMIN_EMAIL || 'heinpyaeshlum@gmail.com').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'asqw12'
  const defaultDepartment = process.env.DEFAULT_DEPARTMENT || 'Administration'

  await mongoose.connect(mongoUri)

  const UserModel = mongoose.model<User>('User', UserSchema)
  const DepartmentModel = mongoose.model<Department>('Department', DepartmentSchema)
  const SettingModel = mongoose.model<Setting>('Setting', SettingSchema)

  let department = await DepartmentModel.findOne({ name: defaultDepartment }).exec()
  if (!department) {
    department = await DepartmentModel.create({
      name: defaultDepartment,
      description: 'System default department',
    })
  }

  const existingAdmin = await UserModel.findOne({ email: adminEmail }).exec()
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10)
    await UserModel.create({ email: adminEmail, password: hashed, role: Role.Admin })
  }

  await SettingModel.updateOne(
    { key: 'system' },
    {
      $set: {
        key: 'system',
        value: {
          appName: 'Management System',
          supportEmail: adminEmail,
          timezone: 'UTC',
          maintenanceMode: false,
          defaultDepartmentId: department._id.toString(),
        },
        description: 'Core system settings',
      },
    },
    { upsert: true },
  )

  console.log('Production seed completed.')
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
