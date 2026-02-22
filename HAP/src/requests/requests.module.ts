import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { RequestsController } from './requests.controller'
import { RequestsService } from './requests.service'
import { Request, RequestSchema } from './schemas/request.schema'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
    EmailModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
