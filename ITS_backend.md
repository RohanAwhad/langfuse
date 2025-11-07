


1. Start ITS-Hub Server (Terminal 1)
Install its-hub

# Install its-hub
pip install its-hub
# From your ITS-Hub directory
uv run its-iaas --host 0.0.0.0 --port 8108
Then configure it:

# In another terminal, configure ITS-Hub
source .env
curl -X POST http://localhost:8108/configure \
    -H "Content-Type: application/json" \
    -d '{
        "provider": "litellm",
        "endpoint": "auto",
        "api_key": "'"$OPENAI_API_KEY"'",
        "model": "gpt-4.1-mini",
        "alg": "best-of-n",
        "rm_name": "llm-judge",
        "judge_model": "gpt-4.1-mini",
        "judge_base_url": "auto",
        "judge_mode": "groupwise",
        "judge_criterion": "multi_step_tool_judge",
        "judge_api_key": "'"$OPENAI_API_KEY"'",
        "judge_temperature": 0.7,
        "judge_max_tokens": 2048
    }'

a success message should get posted back

2. Start Portkey Gateway (Terminal 2)


# From the gateway directory
cd gateway && npm run dev:node
Wait for the message:

🚀 Your AI Gateway is running at:
   http://localhost:8787
