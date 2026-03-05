# Git City - VS Code Extension

Make your [Git City](https://thegitcity.com) building glow when you code.

## How it works

1. Generate your API key at [thegitcity.com](https://thegitcity.com) (click "coding now" in the top bar)
2. Install this extension
3. Run `Cmd+Shift+P` > "Git City: Set API Key" and paste your key
4. Start coding. Your building lights up in ~30 seconds.

When you're actively coding, your building glows in the city and you appear in the live feed. Stop coding and it fades after a few minutes.

## Commands

| Command | Description |
|---------|-------------|
| `Git City: Set API Key` | Connect your account |
| `Git City: Remove API Key` | Disconnect |
| `Git City: Toggle Tracking` | Pause/resume tracking |
| `Git City: Open Dashboard` | Open Git City in your browser |

## Privacy

**You are in full control of what gets shared.**

By default, the extension sends:

| Data | Public? | Can disable? |
|------|---------|-------------|
| Username | Yes (your GitHub login) | No (needed to identify your building) |
| Language | Yes (e.g. "TypeScript") | Yes, via `gitCity.privacy.shareLanguage` |
| Project name | **No, never public** | Yes, via `gitCity.privacy.shareProject` |
| Branch name | **No, never public** | Excluded with project |
| File paths | **Never sent** | N/A |
| Code contents | **Never sent** | N/A |

**What is never collected:** file contents, code, diffs, clipboard, terminal output, file paths, or any intellectual property.

**Project names** are stored server-side for your personal analytics only. They are never shown to other users, never included in any public API, and never broadcast. You can disable sending them entirely.

### Privacy settings

Open VS Code Settings (`Cmd+,`) and search for "Git City":

- `gitCity.privacy.shareLanguage` - Share the programming language (default: on)
- `gitCity.privacy.shareProject` - Send project name to server for personal analytics (default: on)
- `gitCity.privacy.excludeProjects` - List of project names to never track (e.g. `["secret-project", "client-work"]`)
- `gitCity.enabled` - Disable all tracking entirely
- `gitCity.idleTimeout` - Seconds of inactivity before going idle (default: 300)

## Status bar

The status bar shows your current state:

- `$(broadcast) Git City: Live` - Tracking active, your building is glowing
- `$(debug-pause) Git City: Paused` - Tracking paused
- `$(key) Git City: Connect` - No API key set

Click the status bar item to toggle tracking on/off.
