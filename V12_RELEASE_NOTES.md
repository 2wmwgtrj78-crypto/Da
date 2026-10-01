# Dakshinamurthy v12.0.0

## Focus
AI-ready feedback loop + release hardening. Existing navigation is preserved; no new study tabs are introduced.

## Changes
- Preserved the familiar navigation from v11.1.x.
- Kept Viva and mock-exam workflows/content excluded.
- Feedback storage upgraded to a v2 local format with a stable local feedback ID and screen context.
- AI feedback packet now carries app version, current screen, feedback IDs and a clear analysis instruction.
- Added one-tap **AI prompt** copy alongside Copy for AI, Share and Download.
- JSON export remains offline/local and is suitable for later AI ingestion.
- Updated application and service-worker release markers to 12.0.0.

## Safety / privacy
Feedback is stored locally. No automatic upload or background transmission is added.
