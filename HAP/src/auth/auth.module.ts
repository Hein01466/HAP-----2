import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import type { StringValue } from 'ms'
import { UsersModule } from '../users/users.module'
import { EmailModule } from '../email/email.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    UsersModule,
    EmailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-me',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as StringValue,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
