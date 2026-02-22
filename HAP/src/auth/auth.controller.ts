import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { ApiTags } from '@nestjs/swagger'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  login(@Body() dto: CreateUserDto) {
    return this.authService.login(dto.email, dto.password)
  }
}
