import { useState } from "react";

/**
 * Drives a create/edit dialog form backed by a server action: submitting
 * calls `action`, stores whatever state it returns, and closes the dialog
 * on success. Deliberately not built on useActionState + useEffect — closing
 * the dialog is a direct consequence of the submit handler's own result, so
 * it's handled right there instead of being inferred later from a state
 * transition (which would need either an effect or a render-phase ref
 * mutation, both disallowed under the stricter React Compiler-era lint
 * rules this project runs with).
 */
export function useDialogFormAction<S extends { success?: boolean }>(
  action: (prevState: S, formData: FormData) => Promise<S>,
  initialState: S,
) {
  const [state, setState] = useState<S>(initialState);
  const [open, setOpen] = useState(false);

  async function formAction(formData: FormData) {
    const result = await action(state, formData);
    setState(result);
    if (result.success) setOpen(false);
  }

  return { state, formAction, open, setOpen };
}
