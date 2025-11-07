# Inference Time Scaling Setup

## Overview

This implementation provides a UI and backend for configuring ITS-Hub's Best-of-N algorithm for inference time optimization.

## Architecture

### Simplified Design
- **Assumes services are already running**: ITS-Hub and Portkey Gateway must be started manually
- **Backend only does configuration**: Sends HTTP POST to ITS-Hub `/configure` endpoint
- **No process management**: No spawning, health checks, or service lifecycle management

### Components

1. **Frontend**: `/web/src/pages/project/[projectId]/optimization/inference-time-scaling.tsx`
   - Configuration form for Best-of-N algorithm
   - Fields: provider, model, judge model, judge mode, temperature, max tokens, criterion
   - Calls tRPC mutation on button click

2. **Backend Service**: `/web/src/features/optimization/server/service.ts`
   - Single function: `configureItsHub(config)`
   - Sends POST request to `http://localhost:8108/configure`
   - Returns success/failure based on HTTP response

3. **tRPC Router**: `/web/src/features/optimization/server/optimizationRouter.ts`
   - Single mutation: `optimization.configure`
   - Validates input with Zod v4
   - Calls service layer

4. **Environment Variables**: `.env`
   ```bash
   ITS_HUB_URL=http://localhost:8108
   PORTKEY_GATEWAY_URL=http://localhost:8787
   ```

## Setup Instructions

### Prerequisites
1. Install ITS-Hub:
   ```bash
   pip install its-hub
   ```

2. Clone Portkey Gateway (if not already done):
   ```bash
   cd /Users/gxxu/Desktop/its_integration/langfuse
   # Gateway should be in ./gateway directory
   ```

### Running the Services

**Terminal 1 - Start ITS-Hub**:
```bash
uv run its-iaas --host 0.0.0.0 --port 8108
```

**Terminal 2 - Start Portkey Gateway**:
```bash
cd gateway
npm run dev:node
```

**Terminal 3 - Start Langfuse**:
```bash
pnpm run dev:web
```

### Testing the Configuration

#### Option 1: Via UI
1. Navigate to: `http://localhost:3000/project/[projectId]/optimization/inference-time-scaling`
2. Fill in the configuration form:
   - Provider: `litellm` (default)
   - Model: `gpt-4o-mini`
   - Judge Model: `gpt-4o-mini`
   - Judge Mode: `groupwise`
   - Judge Temperature: `0.7`
   - Judge Max Tokens: `2048`
   - Judge Criterion: Your evaluation criteria (required)
3. Click "Configure Algorithm"
4. Check for success toast notification

#### Option 2: Via Test Script
```bash
./test-simple-config.sh
```

This will send a configuration request directly to ITS-Hub.

## Implementation Details

### Configuration Payload
The backend sends this payload to ITS-Hub:
```json
{
  "provider": "litellm",
  "endpoint": "auto",
  "api_key": "<OPENAI_API_KEY from env>",
  "model": "gpt-4o-mini",
  "alg": "best-of-n",
  "rm_name": "llm-judge",
  "judge_model": "gpt-4o-mini",
  "judge_base_url": "auto",
  "judge_mode": "groupwise",
  "judge_criterion": "<user input>",
  "judge_api_key": "<OPENAI_API_KEY from env>",
  "judge_temperature": 0.7,
  "judge_max_tokens": 2048
}
```

### Error Handling
- **Network errors**: Caught and converted to TRPCError
- **HTTP errors**: Response status checked, error text logged
- **Validation errors**: Zod validates all inputs before sending
- **Logging**: All steps logged with Winston
- **Tracing**: Errors sent to OpenTelemetry/DataDog via `traceException`

### Success Criteria
- HTTP 200 or 201 from `/configure` endpoint
- Response JSON parsed successfully
- Success toast shown in UI
- Configuration logged in server logs

## Files Modified

1. `/web/src/components/layouts/routes.tsx` - Added Optimization navigation
2. `/web/src/components/layouts/utilities/routes.ts` - Added Optimization to group order
3. `/web/src/pages/project/[projectId]/optimization/inference-time-scaling.tsx` - New UI page
4. `/web/src/features/optimization/server/service.ts` - Configuration service
5. `/web/src/features/optimization/server/optimizationRouter.ts` - tRPC router
6. `/web/src/server/api/root.ts` - Registered optimization router
7. `/web/src/env.mjs` - Added ITS_HUB_URL and PORTKEY_GATEWAY_URL
8. `.env` - Set optimization service URLs

## Troubleshooting

### ITS-Hub not responding
- Check if running: `curl http://localhost:8108/health`
- Start it: `uv run its-iaas --host 0.0.0.0 --port 8108`

### Configuration fails
- Check server logs for detailed error messages
- Verify OPENAI_API_KEY is set in `.env`
- Ensure payload matches ITS-Hub's expected format

### UI not showing
- Check browser console for errors
- Verify project ID in URL is valid
- Ensure Langfuse dev server is running on port 3000
