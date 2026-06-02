import { ValidationError } from "./utils";
import { TIME_REGEXP } from "./utils";


export function validateTimeSlot(slot) {
  if (! TIME_REGEXP.test(slot)) {
    throw new ValidationError('Franja horaria inválida', '');
  }

  return true;
}
