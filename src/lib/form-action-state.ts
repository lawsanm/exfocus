export interface FormActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}
