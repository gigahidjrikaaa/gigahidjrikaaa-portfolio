type FormFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isFormFieldElement(target: EventTarget | null): target is FormFieldElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

export function clearFieldError(target: EventTarget | null): void {
  if (!isFormFieldElement(target)) {
    return;
  }

  const value = target.value?.trim?.() ?? String(target.value ?? "").trim();
  const isValidValue = target.type === "number" ? value !== "" : value.length > 0;

  if (isValidValue || target.checkValidity()) {
    target.removeAttribute("aria-invalid");
    target.removeAttribute("data-missing-field");
  }
}

function clearAllFieldErrors(form: HTMLFormElement): void {
  const invalidFields = form.querySelectorAll("[aria-invalid='true'], [data-missing-field='true']");
  invalidFields.forEach((field) => {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("data-missing-field");
  });
}

export function highlightMissingFields(form: HTMLFormElement | null, fieldIds: string[]): void {
  if (!form) {
    return;
  }

  clearAllFieldErrors(form);

  let firstInvalidField: FormFieldElement | null = null;

  fieldIds.forEach((fieldId) => {
    const field = form.querySelector<HTMLElement>(`#${fieldId}`);
    if (!field) {
      return;
    }

    field.setAttribute("aria-invalid", "true");
    field.setAttribute("data-missing-field", "true");

    if (!firstInvalidField && isFormFieldElement(field)) {
      firstInvalidField = field;
    }
  });

  if (firstInvalidField) {
    firstInvalidField.focus();
    firstInvalidField.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}
