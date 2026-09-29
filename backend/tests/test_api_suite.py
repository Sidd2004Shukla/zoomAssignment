import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=== STARTING AUTOMATED BACKEND VERIFICATION ===")

# 1. Health
r = client.get("/api/v1/health")
assert r.status_code == 200, f"Health failed: {r.text}"
print("1. GET /health -> 200 OK:", r.json())

# 2. Create User
user_data = {"auth_provider_user_id": "clerk_test_user_1", "email": "testuser1@example.com", "name": "Test User 1"}
r = client.post("/api/v1/users", json=user_data)
assert r.status_code in (200, 201), f"User create failed: {r.text}"
user = r.json()
print("2. POST /users ->", r.status_code, "User ID:", user["id"])

# 3. Create Meeting
meeting_data = {"host_user_id": user["id"], "title": "Test Zoom Architecture Meeting", "description": "Full stack test"}
r = client.post("/api/v1/meetings", json=meeting_data)
assert r.status_code == 201, f"Meeting create failed: {r.text}"
meeting = r.json()
print("3. POST /meetings -> 201 Created. Meeting ID:", meeting["id"], "Code:", meeting["meeting_code"])

# 4. Get Meeting by ID & Code
r = client.get(f"/api/v1/meetings/{meeting['id']}")
assert r.status_code == 200
r_code = client.get(f"/api/v1/meetings/{meeting['meeting_code']}")
assert r_code.status_code == 200
print("4. GET /meetings/{id} and {code} -> 200 OK")

# 5. Join Meeting as Guest
r = client.post(f"/api/v1/meetings/{meeting['id']}/join", json={"display_name": "Guest Bob"})
assert r.status_code == 200, f"Join failed: {r.text}"
participant = r.json()
print("5. POST /meetings/{id}/join -> 200 OK. Participant ID:", participant["id"], "Role:", participant["role"])

# 6. List Participants
r = client.get(f"/api/v1/meetings/{meeting['id']}/participants")
assert r.status_code == 200
participants = r.json()
print("6. GET /meetings/{id}/participants -> 200 OK. Count:", len(participants))
assert len(participants) >= 2, "Host and guest should both be in participants"

# 7. Mute Participant
r = client.post(f"/api/v1/meetings/{meeting['id']}/participants/{participant['id']}/mute", json={"is_muted": True})
assert r.status_code == 200
print("7. POST /meetings/{id}/participants/{id}/mute -> 200 OK. is_muted:", r.json()["is_muted"])

# 8. Mute All
r = client.post(f"/api/v1/meetings/{meeting['id']}/participants/mute-all")
assert r.status_code == 200
print("8. POST /meetings/{id}/participants/mute-all -> 200 OK:", r.json())

# 9. Generate ZEGOCLOUD Kit Token
token_req = {"room_id": meeting["meeting_code"], "user_id": user["id"], "user_name": "Test User 1"}
r = client.post(f"/api/v1/meetings/{meeting['id']}/zego-token", json=token_req)
assert r.status_code == 200, f"Zego token failed: {r.text}"
token_data = r.json()
assert token_data["token"].startswith("04"), "Zego kit token should start with 04"
print("9. POST /meetings/{id}/zego-token -> 200 OK. Token prefix:", token_data["token"][:25], "App ID:", token_data["app_id"])

# 10. Update Meeting
r = client.patch(f"/api/v1/meetings/{meeting['id']}", json={"status": "ACTIVE"})
assert r.status_code == 200
print("10. PATCH /meetings/{id} -> 200 OK. Status:", r.json()["status"])

# 11. Leave Meeting
r = client.post(f"/api/v1/meetings/{meeting['id']}/leave", headers={"X-User-Id": user["id"]})
assert r.status_code == 200
print("11. POST /meetings/{id}/leave -> 200 OK")

# 12. Remove Participant
r = client.delete(f"/api/v1/meetings/{meeting['id']}/participants/{participant['id']}")
assert r.status_code == 200
print("12. DELETE /meetings/{id}/participants/{id} -> 200 OK")

# 13. Audit Events
r = client.get(f"/api/v1/meetings/{meeting['id']}/events")
assert r.status_code == 200, f"Audit events failed: {r.text}"
events = r.json()
print("13. GET /meetings/{id}/events -> 200 OK. Total events logged:", len(events))
assert len(events) >= 5, "Should have logged meeting created, joined, muted, leave, removed events"

print("\n=== ALL 13 BACKEND ENDPOINTS & STAGES VERIFIED PERFECTLY! ===")
