import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PreviewController } from './preview/preview.controller';
import { PreviewService } from './preview/preview.service';
import { DeleteController } from './delete/delete.controller';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [AppController, PreviewController, DeleteController],
  providers: [AppService, PreviewService],
})
export class AppModule {}
