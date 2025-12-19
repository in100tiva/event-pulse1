import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Roda a cada 5 minutos para liberar vagas de no-shows
crons.interval(
  "release-no-show-slots",
  { minutes: 5 },
  internal.attendance.releaseNoShowSlots
);

// Desativar enquetes expiradas a cada 10 segundos
crons.interval(
  "deactivate-expired-polls",
  { seconds: 10 },
  internal.polls.deactivateExpiredPolls
);

export default crons;
