import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PreviewController } from './preview/preview.controller';
import { PreviewService } from './preview/preview.service';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [AppController, PreviewController],
  providers: [AppService, PreviewService],
})
export class AppModule {}
