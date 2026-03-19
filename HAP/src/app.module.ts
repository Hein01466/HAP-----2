import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { DepartmentsModule } from './departments/departments.module'
import { AssetsModule } from './assets/assets.module'
import { EmployeesModule } from './employees/employees.module'
import { ProjectsModule } from './projects/projects.module'
import { TasksModule } from './tasks/tasks.module'
import { RequestsModule } from './requests/requests.module'
import { InventoryModule } from './inventory/inventory.module'
import { VendorsModule } from './vendors/vendors.module'
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module'
import { MaintenanceModule } from './maintenance/maintenance.module'
import { AuditLogsModule } from './audit-logs/audit-logs.module'
import { SettingsModule } from './settings/settings.module'
import { EmailModule } from './email/email.module'
import { AuditLogInterceptor } from './audit-logs/audit-log.interceptor'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/hap'),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
          limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
        },
      ],
    }),
    AuthModule,
    UsersModule,
    DepartmentsModule,
    AssetsModule,
    EmployeesModule,
    ProjectsModule,
    TasksModule,
    RequestsModule,
    InventoryModule,
    VendorsModule,
    PurchaseOrdersModule,
    MaintenanceModule,
    AuditLogsModule,
    SettingsModule,
    EmailModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}
