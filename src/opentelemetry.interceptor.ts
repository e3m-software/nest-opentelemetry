import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap } from "rxjs";
import { Span, trace } from "@opentelemetry/api";
import { OPEN_TELEMETRY } from "./constants";
import { SpanConfig } from "./opentelemetry.interface";

@Injectable()
export class OpentelemetryInterceptor implements NestInterceptor {
  constructor(protected readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const openTelemetry = this.reflector.get<SpanConfig>(
      OPEN_TELEMETRY,
      context.getHandler()
    );
    if (openTelemetry) {
      return trace
        .getTracer(process.env.OTEL_SERVICE_NAME)
        .startActiveSpan(openTelemetry.name, (span: Span) => {
          const request = context.switchToHttp().getRequest();
          request.span = span; // Attach the span to the request object

          return next.handle().pipe(
            tap({
              next: () => {
                // End the span on successful completion
                span.end();
              },
              error: (err) => {
                // Record the exception and end the span on error
                span.recordException(err);
                span.end();
              },
            })
          );
        });
    }
    return next.handle();
  }
}
