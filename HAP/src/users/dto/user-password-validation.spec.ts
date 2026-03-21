import { validate } from 'class-validator'
import { CreateUserDto } from './create-user.dto'
import { UpdateUserDto } from './update-user.dto'

describe('User password validation', () => {
  it('accepts passwords with both letters and numbers on create', async () => {
    const dto = new CreateUserDto()
    dto.email = 'user@example.com'
    dto.password = 'abc123'

    const errors = await validate(dto)

    expect(errors).toHaveLength(0)
  })

  it('rejects passwords without numbers on create', async () => {
    const dto = new CreateUserDto()
    dto.email = 'user@example.com'
    dto.password = 'abcdef'

    const errors = await validate(dto)

    expect(errors[0]?.constraints).toMatchObject({
      matches: 'password must include letters and numbers',
    })
  })

  it('accepts passwords with both letters and numbers on update', async () => {
    const dto = new UpdateUserDto()
    dto.password = 'abc123'

    const errors = await validate(dto)

    expect(errors).toHaveLength(0)
  })
})
