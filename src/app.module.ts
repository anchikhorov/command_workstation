import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PreviewController } from './preview/preview.controller';
import { PreviewService } from './preview/preview.service';
import { DeleteController } from './delete/delete.controller';
import { ResumeController } from './resume/resume.controller';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [AppController, PreviewController, DeleteController, ResumeController],
  providers: [AppService, PreviewService],
})
export class AppModule {}
