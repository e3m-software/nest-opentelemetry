import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { OpentelemetryInterceptor } from "./opentelemetry.interceptor";

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: OpentelemetryInterceptor,
    },
  ],
})
export class OpentelemetryModule {}
