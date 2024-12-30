# Opentelemetry NestJS

OpenTelemetry NestJS is a module that provides instrumentation for NestJS applications.

## Installation

```bash
npm install @e3m-software/nest-opentelemetry
```

## Usage

```typescript
// app.module.ts
@Module({
  imports: [OpentelemetryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

// Optional can be skipped ( But for controller you need to use CustomSpanRouter )
@Controller("v1/auth/admin")
export class AuthAdminController {
  constructor(private orchestrator: AuthOrchestrator) {}
  @Post()
  @Public(true)
  @CustomSpanRouter({ name: "WHATEVER_YOU_WANT_SPAN_NAME" })
  async login(@Body() body: DTO, @SpanRouter() span: unknown) {
    // Your Code
  }
}

// Outside of The Controller
@Injectable()
export class AuthOrchestrator {
  @CustomSpanMethod({ name: "WHATEVER_YOU_WANT_SPAN_NAME" })
  async loginCustomer(data): Promise<any> {
    // Your Code
  }
}

// What about using inside function....
// Simply use this CustomSpanWrapper()
@Injectable()
export class AuthOrchestrator {
  @CustomSpanMethod({ name: "WHATEVER_YOU_WANT_SPAN_NAME" })
  async loginCustomer(data): Promise<any> {
    // You can use this
    await CustomSpanWrapper(
      { name: "WHATEVER_YOU_WANT_SPAN_NAME" },
      async () => {
        // Your Code
      }
    );
  }
}
```
