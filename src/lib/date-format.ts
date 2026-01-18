import { format } from "date-fns";
import { es } from "date-fns/locale";

type DateInput = Date | string;

export const formatEventTime = (startsAt: DateInput, endsAt: DateInput) => {
  const start = startsAt instanceof Date ? startsAt : new Date(startsAt);
  const end = endsAt instanceof Date ? endsAt : new Date(endsAt);
  return `${format(start, "d MMM HH:mm", { locale: es })} - ${format(end, "HH:mm", { locale: es })}`;
};
