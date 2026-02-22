import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { AuditLogsService } from './audit-logs.service'

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const { method, originalUrl, params, user } = request

    return next.handle().pipe(
      tap(async () => {
        if (method === 'GET') return
        const entity = (originalUrl || '').split('/')[1] || 'unknown'
        const entityId = params?.id || ''
        try {
          await this.auditLogsService.create({
            action: method.toLowerCase(),
            actorId: user?.id,
            entity,
            entityId,
            metadata: { path: originalUrl },
          })
        } catch {
          // avoid blocking requests on audit failures
        }
      }),
    )
  }
}
