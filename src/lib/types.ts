export type Transport = "Public transit" | "Walking" | "Driving" | "Delivery";
export type Role = "Family" | "Volunteer" | "Organization";
export type RequestStatus =
  "Awaiting review" | "Arranging assistance" | "Scheduled" | "Completed";
export interface FoodLocation {
  id: string;
  name: string;
  neighborhood: string;
  borough: string;
  zip: string;
  address: string;
  lat: number;
  lng: number;
  type: "Food pantry" | "Prepared meals" | "Mobile distribution" | "Food bank";
  description: string;
  days: number[];
  start: number;
  end: number;
  dietary: string[];
  languages: string[];
  accessible: boolean | null;
  delivery: boolean | null;
  appointment: boolean | null;
  noId: boolean | null;
  verified: boolean;
  updatedAt: string;
  inventory: string[];
  instructions: string;
  image: string;
  householdLimit?: number;
  sourceKind?: "public" | "demo";
  sourceName?: string;
  sourceUrl?: string;
  sourceRecordUrl?: string;
  importedAt?: string;
  phone?: string;
  website?: string;
  serviceTypes?: string[];
  weeklySchedule?: ServiceWindow[];
  scheduleNotes?: string;
  conditionalSchedule?: boolean;
  postedSchedule?: string;
}
export interface ServiceWindow {
  day: number;
  start: number;
  end: number;
  service?: string;
}
export interface TravelStep {
  instruction: string;
  meters: number;
}
export interface TravelRoute {
  provider: string;
  retrievedAt: string;
  mode: "Walking" | "Driving";
  outboundMinutes: number;
  returnMinutes: number;
  meters: number;
  coordinates: [number, number][];
  destination: [number, number];
  steps: TravelStep[];
}
export type VisitStatus =
  "Planned" | "On my way" | "Collected" | "Could not collect";
export interface Opportunity {
  id: string;
  orgId: string;
  title: string;
  activity: string;
  date: string;
  start: number;
  end: number;
  capacity: number;
  filled: number;
  priority: boolean;
  active: boolean;
  minAge: number;
  accessible: boolean;
  group: boolean;
  recurring: boolean;
  requirements: string[];
  description: string;
}
export interface Signup {
  id: string;
  opportunityId: string;
  createdAt: string;
}
export interface VisitPlan {
  id: string;
  locationId: string;
  date: string;
  transport: Transport;
  checklist: string[];
  originArea?: string;
  arrivalMinutes?: number;
  windowStart?: number;
  windowEnd?: number;
  route?: TravelRoute;
  outboundMinutes?: number;
  returnMinutes?: number;
  travelTimeSource?: "route" | "user" | "unavailable";
  providerConfirmed?: boolean;
  status?: VisitStatus;
  outcomeNote?: string;
}
export interface AssistanceRequest {
  id: string;
  locationId: string;
  area: string;
  type: string;
  date: string;
  window: string;
  status: RequestStatus;
  assignedVolunteer?: string;
  createdAt: string;
}
export interface FoodPreferences {
  area: string;
  household: number;
  day: string;
  period: string;
  transport: Transport;
  maxMinutes: number;
  dietary: string;
  accessible: boolean;
  noId: boolean;
}
export interface VolunteerPreferences {
  area: string;
  day: string;
  activity: string;
  maxMiles: number;
  minAge: number;
  accessible: boolean;
  duration: number;
  group: boolean;
  recurring: boolean;
  skill: string;
}
export interface DemoState {
  version: number;
  role: Role;
  locations: FoodLocation[];
  opportunities: Opportunity[];
  signups: Signup[];
  plans: VisitPlan[];
  requests: AssistanceRequest[];
  saved: string[];
}
