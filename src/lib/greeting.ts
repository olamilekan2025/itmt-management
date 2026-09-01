/**
 * Returns a time-of-day greeting ("Good morning", "Good afternoon",
 * "Good evening", "Good night") based on the current local hour,
 * or an hour/date you pass in.
 *
 * Reusable anywhere in the app — dashboards, emails, notifications:
 *
 *   import { getGreeting } from "@/lib/greeting";
 *
 *   getGreeting();              // uses the current time
 *   getGreeting(new Date());    // explicit Date
 *   getGreeting(9);             // explicit hour (0-23), e.g. for tests
 */
export function getGreeting(input: Date | number = new Date()): string {
  const hour = typeof input === "number" ? input : input.getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";

  return "Good night";
}

/**
 * Convenience helper that prefixes the greeting with a name, falling
 * back to a generic "there" when no name is available.
 *
 *   getWelcomeMessage("Ada");        // "Good morning, Ada"
 *   getWelcomeMessage(undefined);    // "Good morning, there"
 */
export function getWelcomeMessage(
  name?: string | null,
  input: Date | number = new Date(),
): string {
  return `${getGreeting(input)}, ${name?.trim() || "there"}`;
}
