import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ContactModule, HealthModule],
})
export class AppModule {}
