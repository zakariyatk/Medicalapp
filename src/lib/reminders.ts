import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORE_PREFIX = "medifam_reminder_";

// expo-notifications' web build is incomplete in this SDK, so it's loaded dynamically and only
// on native — this keeps web (preview/testing only; the app targets native) from ever touching it.
type NotificationsModule = typeof import("expo-notifications");
let notificationsPromise: Promise<NotificationsModule> | null = null;
function getNotifications(): Promise<NotificationsModule> | null {
  if (Platform.OS === "web") return null;
  if (!notificationsPromise) notificationsPromise = import("expo-notifications");
  return notificationsPromise;
}

export function parseFrequencyToTimes(frequency: string): string[] {
  const f = frequency.toLowerCase();
  if (/\b4x|four times\b/.test(f)) return ["07:00", "12:00", "17:00", "22:00"];
  if (/\b3x|three times|thrice\b/.test(f)) return ["08:00", "14:00", "20:00"];
  if (/\b2x|twice|two times\b/.test(f)) return ["09:00", "21:00"];
  if (/\b1x|once( a day)?|once daily|every morning\b/.test(f)) return ["09:00"];
  return [];
}

export function parseDurationDays(duration: string): number {
  const match = duration.match(/(\d+)\s*day/i);
  return match ? parseInt(match[1], 10) : 0;
}

async function getReminderIds(medicineId: string): Promise<string[]> {
  try {
    const raw = await SecureStore.getItemAsync(STORE_PREFIX + medicineId);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

async function setReminderIds(medicineId: string, ids: string[]) {
  try {
    if (ids.length === 0) {
      await SecureStore.deleteItemAsync(STORE_PREFIX + medicineId);
    } else {
      await SecureStore.setItemAsync(STORE_PREFIX + medicineId, JSON.stringify(ids));
    }
  } catch {
    // SecureStore isn't available on this platform/build — reminder state just won't persist.
  }
}

export async function isReminderActive(medicineId: string): Promise<boolean> {
  const ids = await getReminderIds(medicineId);
  return ids.length > 0;
}

export async function cancelMedicineReminders(medicineId: string): Promise<void> {
  const ids = await getReminderIds(medicineId);
  const notifications = getNotifications();
  if (notifications) {
    const Notifications = await notifications;
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
  }
  await setReminderIds(medicineId, []);
}

export type ScheduleResult = { scheduled: boolean; count: number; reason?: string };

export async function scheduleMedicineReminders(params: {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}): Promise<ScheduleResult> {
  const times = parseFrequencyToTimes(params.frequency);
  const days = parseDurationDays(params.duration);

  if (times.length === 0) {
    return { scheduled: false, count: 0, reason: "Couldn't work out a fixed time of day from the frequency." };
  }
  if (days === 0) {
    return { scheduled: false, count: 0, reason: "No fixed course length to schedule reminders against." };
  }

  const notifications = getNotifications();
  if (!notifications) {
    return { scheduled: false, count: 0, reason: "Reminders need the native app (not supported in a web browser)." };
  }

  try {
    const Notifications = await notifications;
    const permission = await Notifications.requestPermissionsAsync();
    const iosStatus = (permission as { ios?: { status?: number } }).ios?.status;
    if (permission.status !== "granted" && !iosStatus) {
      return { scheduled: false, count: 0, reason: "Notification permission was not granted." };
    }

    await cancelMedicineReminders(params.medicineId);

    const ids: string[] = [];
    const now = new Date();
    for (let day = 0; day < days; day++) {
      for (const time of times) {
        const [hour, minute] = time.split(":").map(Number);
        const fireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hour, minute, 0, 0);
        if (fireDate.getTime() <= Date.now()) continue;
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for ${params.medicineName}`,
            body: `${params.dosage} — part of your prescription`,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
        });
        ids.push(id);
      }
    }

    await setReminderIds(params.medicineId, ids);
    return { scheduled: ids.length > 0, count: ids.length };
  } catch {
    return { scheduled: false, count: 0, reason: "Notifications aren't available on this device/build." };
  }
}

export async function scheduleRemindersForMedicines(
  medicines: { medicineId: string; medicineName: string; dosage: string; frequency: string; duration: string }[]
): Promise<{ scheduledCount: number; totalCount: number }> {
  let scheduledCount = 0;
  for (const med of medicines) {
    const result = await scheduleMedicineReminders(med);
    if (result.scheduled) scheduledCount += 1;
  }
  return { scheduledCount, totalCount: medicines.length };
}
