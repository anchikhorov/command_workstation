import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';


@Module({
  imports: [
    HttpModule,
  ],
  controllers: [],
  providers: [
    AppService, 
    AppGateway
  ],
})
export class AppModule {}
