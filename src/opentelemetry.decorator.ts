import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import { trace, Span } from "@opentelemetry/api";
import { OPEN_TELEMETRY } from "./constants";
import { SpanConfig } from "./opentelemetry.interface";

export const CustomSpanRouter = (arg: SpanConfig) =>
  SetMetadata(OPEN_TELEMETRY, arg);

export const SpanRouter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.span;
  }
);

export const CustomSpanMethod = (arg: SpanConfig): MethodDecorator => {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return trace
        .getTracer(process.env.OTEL_SERVICE_NAME)
        .startActiveSpan(arg.name, async (span: Span) => {
          try {
            // Attach the span to the instance
            this.span = span;

            return await originalMethod.apply(this, args);
          } catch (error) {
            span.recordException(error);
            throw error;
          } finally {
            span.end();

            // Clean up the span from the instance
            delete this.span;
          }
        });
    };

    return descriptor;
  };
};

export const CustomSpanWrapper = async <T>(
  arg: SpanConfig,
  fn: (span: Span) => Promise<T> | T
): Promise<T> => {
  return trace
    .getTracer(process.env.OTEL_SERVICE_NAME)
    .startActiveSpan(arg.name, async (span: Span) => {
      try {
        return await fn(span);
      } catch (error) {
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
};
