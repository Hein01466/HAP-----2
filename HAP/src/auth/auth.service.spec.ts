import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { AuthService } from './auth.service'
import { Role } from '../users/role.enum'
import { CreateUserDto } from '../users/dto/create-user.dto'

describe('AuthService', () => {
  let authService: AuthService

  const usersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  }

  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as JwtService

  const emailService = {
    sendMail: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    authService = new AuthService(
      usersService as never,
      jwtService,
      emailService as never,
    )
  })

  it('forces registered user role to user', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'abc123',
      role: Role.Admin,
    }

    usersService.create.mockResolvedValue({
      id: 'user-1',
      email: dto.email,
      role: Role.User,
    })

    const result = await authService.register(dto)

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: dto.email,
        role: Role.User,
        password: expect.any(String),
      }),
    )
    expect(emailService.sendMail).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      id: 'user-1',
      email: dto.email,
      role: Role.User,
    })
  })

  it('returns access token for valid login', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      password: await bcrypt.hash('abc123', 10),
      role: Role.User,
    })
    ;(jwtService.signAsync as jest.Mock).mockResolvedValue('jwt-token')

    const result = await authService.login('test@example.com', 'abc123')

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'test@example.com',
      role: Role.User,
    })
    expect(result).toEqual({ access_token: 'jwt-token' })
  })

  it('throws unauthorized for invalid login', async () => {
    usersService.findByEmail.mockResolvedValue(null)

    await expect(authService.login('missing@example.com', 'abc123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })
})
