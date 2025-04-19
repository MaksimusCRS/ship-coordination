# 🚢 Ship Coordination Dispatch Service
A maritime traffic control system for calculating and preventing potential ship collisions in open waters.

## Built with:
* NestJS
* TypeORM
* PostgreSQL
* Docker

## 📦 Features
* Log ship positions in real-time
* Track speed and trajectory
* Detect collisions with threat levels:

🟢 green: no threat

🟡 yellow: potential risk

🔴 red: collision predicted within 60 seconds

* Reset system state for testing

* View ship status and position history

### OpenAPI docs via Swagger

🚀 Getting Started
1. Start the system

```bash
   docker compose up
```
   This will start:

API on http://localhost:8080

PostgreSQL database

📚 API Endpoints
Method	Endpoint	Description
POST	/v1/api/ships/:id/position	Send ship position (returns status)
GET	/v1/api/ships	List all ships
GET	/v1/api/ships/:id	Position history for a ship
POST	/v1/api/ships/flush	Clear all ships & positions
✅ Try it live via Swagger UI at:
http://localhost:8080/api

🧪 Run Tests
Make sure the system is running (docker compose up), then run tests:



⚙️ Environment Variables
You can customize settings in .env:

🧠 Design Notes
Positions are timestamped and validated

Speed and direction are calculated using delta between last two points

All ships’ future positions are projected for 60s to assess proximity

1x1 cell resolution grid with infinite size
