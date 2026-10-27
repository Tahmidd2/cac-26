import type { FoodLocation, ServiceWindow, VisitPlan } from "./types";
import { today, datePlus, newYorkMinutes } from "./data";
export function serviceWindows(location: FoodLocation): ServiceWindow[] {
  if (location.weeklySchedule) return location.weeklySchedule;
  return location.days.map((day) => ({
    day,
    start: location.start,
    end: location.end,
    service: location.type,
  }));
}
export function windowsForDate(location: FoodLocation, date: string) {
  return serviceWindows(location)
    .filter((w) => w.day === new Date(date + "T12:00:00").getDay())
    .sort((a, b) => a.start - b.start);
}
export function upcomingWindows(location: FoodLocation, count = 3) {
  const found: Array<{ date: string; window: ServiceWindow }> = [];
  for (let i = 0; i < 15 && found.length < count; i++) {
    const date = datePlus(today, i);
    for (const window of windowsForDate(location, date)) {
      if (i === 0 && window.end * 60 <= newYorkMinutes()) continue;
      found.push({ date, window });
      if (found.length === count) break;
    }
  }
  return found;
}
export function hasFoodToday(location: FoodLocation) {
  return (
    !location.conditionalSchedule &&
    windowsForDate(location, today).some((w) => w.end * 60 > newYorkMinutes())
  );
}
export function validateVisit(
  location: FoodLocation,
  plan: Pick<
    VisitPlan,
    | "date"
    | "arrivalMinutes"
    | "outboundMinutes"
    | "providerConfirmed"
    | "windowStart"
    | "windowEnd"
  >,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(plan.date) || plan.date < today)
    return "Choose today or a future visit date.";
  const windows = windowsForDate(location, plan.date);
  if (serviceWindows(location).length && !windows.length)
    return "The posted schedule does not include this day. Choose a listed day.";
  if (
    !plan.arrivalMinutes ||
    plan.arrivalMinutes < 0 ||
    plan.arrivalMinutes >= 1440
  )
    return "Choose a valid arrival time.";
  if (
    windows.length &&
    !windows.some(
      (w) =>
        plan.arrivalMinutes! >= w.start * 60 &&
        plan.arrivalMinutes! <= w.end * 60 - 10,
    )
  )
    return "Arrive during a posted distribution window, at least 10 minutes before closing.";
  if (
    plan.date === today &&
    plan.arrivalMinutes <= newYorkMinutes() + (plan.outboundMinutes || 0)
  )
    return "There is not enough time to reach this visit today. Choose a later arrival or another date.";
  if (location.sourceKind === "public" && !plan.providerConfirmed)
    return "Confirm the schedule and pickup requirements with the organization before saving this visit.";
  return null;
}
export function setVisitStatus(
  plans: VisitPlan[],
  id: string,
  status: NonNullable<VisitPlan["status"]>,
) {
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error("Visit not found");
  if (
    (plan.status === "Collected" || plan.status === "Could not collect") &&
    status !== "Planned"
  )
    throw new Error("Reset this visit before changing its recorded outcome.");
  return plans.map((p) => (p.id === id ? { ...p, status } : p));
}
export function minutesTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
