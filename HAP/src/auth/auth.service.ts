import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { Role } from '../users/role.enum'
import { EmailService } from '../email/email.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10)
    const user = await this.usersService.create({
      ...dto,
      password: hashed,
      // Force self-registered users to standard role
      role: Role.User,
    })
    await this.emailService.sendMail(
      user.email,
      'Welcome to Management System',
      'Your account has been created successfully.',
    )
    return { id: user.id, email: user.email, role: user.role }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      throw new UnauthorizedException('Invalid credentials')
    }
    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      access_token: await this.jwtService.signAsync(payload),
    }
  }
}
