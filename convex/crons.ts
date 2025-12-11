import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Roda a cada 5 minutos para liberar vagas de no-shows
crons.interval(
  "release-no-show-slots",
  { minutes: 5 },
  internal.attendance.releaseNoShowSlots
);

export default crons;
