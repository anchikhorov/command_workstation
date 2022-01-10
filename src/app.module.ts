import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';


@Module({
  imports: [
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
