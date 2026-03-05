import * as vscode from "vscode";
import { getActiveSeconds, isPaused } from "../activity/tracker";

let statusBarItem: vscode.StatusBarItem;
let updateTimer: ReturnType<typeof setInterval> | undefined;

export function initStatusBar(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = "gitCity.togglePause";
  context.subscriptions.push(statusBarItem);

  updateDisplay("connect");
  statusBarItem.show();

  // Update elapsed time display every 30s
  updateTimer = setInterval(() => {
    if (!isPaused()) {
      updateDisplay("active");
    }
  }, 30_000);

  context.subscriptions.push({ dispose: () => clearInterval(updateTimer) });
}

export function updateDisplay(status: "active" | "idle" | "paused" | "connect") {
  switch (status) {
    case "active": {
      const seconds = getActiveSeconds();
      const timeStr = formatDuration(seconds);
      statusBarItem.text = `$(broadcast) Git City: Live${timeStr ? ` (${timeStr})` : ""}`;
      statusBarItem.backgroundColor = undefined;
      statusBarItem.tooltip = "Click to pause tracking";
      break;
    }
    case "idle":
      statusBarItem.text = "$(broadcast) Git City: Idle";
      statusBarItem.backgroundColor = undefined;
      statusBarItem.tooltip = "Waiting for activity...";
      break;
    case "paused":
      statusBarItem.text = "$(debug-pause) Git City: Paused";
      statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
      statusBarItem.tooltip = "Click to resume tracking";
      break;
    case "connect":
      statusBarItem.text = "$(key) Git City: Connect";
      statusBarItem.backgroundColor = undefined;
      statusBarItem.tooltip = "Click to set your API key";
      statusBarItem.command = "gitCity.login";
      break;
  }

  // Restore command for non-connect states
  if (status !== "connect") {
    statusBarItem.command = "gitCity.togglePause";
  }
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
