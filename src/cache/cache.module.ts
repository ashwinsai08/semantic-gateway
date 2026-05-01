import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global()  // ← makes CacheService available everywhere without importing
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}