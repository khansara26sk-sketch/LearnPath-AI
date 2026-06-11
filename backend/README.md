# LearnPath AI — Backend API

FastAPI backend for an AI-powered education platform with quiz analysis, personalized roadmaps, and an AI tutor chatbot.

## Features

- **Quiz submission** — Store results in MongoDB Atlas with weak-topic analysis
- **Roadmap generation** — Personalized multi-week learning paths
- **AI tutor chat** — Conversational help with history stored in MongoDB
- **Gemini-ready** — Mock AI by default; switch to Google Gemini with one env change
- **REST architecture** — Versioned routes under `/api/v1`
- **Async** — Motor (async MongoDB) + async route handlers

## Project structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, lifespan
│   ├── config.py            # Environment settings
│   ├── core/
│   │   ├── dependencies.py  # DI for services
│   │   └── exceptions.py    # Error handlers
│   ├── database/
│   │   └── connection.py    # MongoDB Atlas connection
│   ├── models/              # Pydantic schemas
│   ├── routes/              # API endpoints
│   └── services/            # Business logic + Gemini
├── docs/
│   └── sample_api_responses.json
├── .env.example
├── requirements.txt
└── run.py
```

## Startup instructions

### 1. Prerequisites

- Python 3.10+
- MongoDB Atlas cluster (or local MongoDB)
- (Optional) Google Gemini API key

### 2. Create virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

```bash
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
```

Edit `.env` and set at minimum:

- `MONGODB_URI` — your Atlas connection string
- `MONGODB_DB_NAME` — database name (default: `learnpath_ai`)

For Gemini (optional):

```env
GEMINI_API_KEY=your_key_here
USE_MOCK_AI=false
```

### 5. Run the server

```bash
# From backend/
python run.py

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Verify

- Health: http://localhost:8000/health
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| POST | `/api/v1/submit-quiz` | Submit quiz + weak topic analysis |
| POST | `/api/v1/generate-roadmap` | Generate personalized roadmap |
| POST | `/api/v1/chat` | AI tutor conversation |

## Sample requests (curl)

**Submit quiz**

```bash
curl -X POST http://localhost:8000/api/v1/submit-quiz \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"learner_42\",\"subject\":\"Mathematics\",\"topic\":\"Algebra\",\"answers\":[{\"question_id\":\"q1\",\"selected_option\":\"b\",\"is_correct\":true},{\"question_id\":\"q2\",\"selected_option\":\"a\",\"is_correct\":false}]}"
```

**Generate roadmap**

```bash
curl -X POST http://localhost:8000/api/v1/generate-roadmap \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"learner_42\",\"subject\":\"Mathematics\",\"weak_topics\":[\"Algebra\",\"Factoring\"],\"duration_weeks\":4}"
```

**Chat with tutor**

```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"learner_42\",\"message\":\"Explain the quadratic formula simply.\",\"subject\":\"Mathematics\"}"
```

Full sample JSON payloads and responses are in [`docs/sample_api_responses.json`](docs/sample_api_responses.json).

## MongoDB collections

| Collection | Purpose |
|------------|---------|
| `quiz_submissions` | Quiz answers + AI analysis |
| `chat_conversations` | Tutor chat message history |

## Enabling Gemini

1. Get an API key from [Google AI Studio](https://aistudio.google.com/).
2. Set in `.env`:

   ```env
   GEMINI_API_KEY=your_key
   USE_MOCK_AI=false
   ```

3. Restart the server. Responses will include `"ai_mode": "gemini"`.

## Error responses

All application errors return JSON:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

HTTP status codes: `400` validation/business errors, `404` not found, `502` AI failures, `503` database errors, `500` unexpected errors.
