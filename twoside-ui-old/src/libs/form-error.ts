import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { ApiError } from "./api/cilent";

class FormError {
	static applyServerErrors<T extends FieldValues>(
	  err: unknown,
	  set_form_error: UseFormSetError<T>,
	  set_banner_error: (message: string) => void
	) {
	  if (err instanceof ApiError && err.fields?.length) {
	    err.fields.forEach((field_error) => {
	      set_form_error(field_error.field as Path<T>, {
	        type: "server",
	        message: field_error.message,
	      });
	    });
	    return;
	  }
	  if (err instanceof ApiError) {
	    set_banner_error(err.message);
	    return;
	  }
	  set_banner_error("Something went wrong. Please try again.");
	}
}

export default FormError;