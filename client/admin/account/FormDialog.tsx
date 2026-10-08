// A one-column form in the shared Modal (design: users.js dialogs), with the server's error
// shown above the fields and the submit button in the footer.
import { useCallback, useId, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { focusFirstError, validateFields, type FieldDef } from '../ui/fields';
import { Modal } from '../ui/overlay';

type Values = Record<string, string>;
type Errors = Record<string, string>;

// Values, per-field errors and the server error for one dialog form.
export function useDialogForm(fields: FieldDef[], initial: Values) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');

  const reset = useCallback((next: Values) => {
    setValues(next);
    setErrors({});
    setServerError('');
  }, []);

  const setValue = (k: string, v: string) => {
    setValues((vs) => ({ ...vs, [k]: v }));
    setErrors((errs) => {
      if (!errs[k]) return errs;
      const { [k]: _gone, ...rest } = errs;
      return rest;
    });
  };

  // Marks invalid fields and focuses the first; `extra` adds checks the field rules can't express.
  const check = (extra: Errors = {}) => {
    const errs = { ...extra, ...validateFields(fields, values) };
    flushSync(() => setErrors(errs));
    focusFirstError(formRef.current);
    return Object.keys(errs).length === 0;
  };

  return { formRef, values, errors, serverError, setServerError, setValue, reset, check };
}

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  savingLabel: string;
  saving: boolean;
  serverError: string;
  formRef: RefObject<HTMLFormElement | null>;
  onSubmit: () => void;
  children: ReactNode;
}

export function FormDialog({
  open, onClose, title, submitLabel, savingLabel, saving, serverError, formRef, onSubmit, children,
}: FormDialogProps) {
  const formId = useId();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      open={open} onClose={onClose} title={title}
      footer={(
        <>
          <button className="abtn ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="abtn primary" type="submit" form={formId} disabled={saving}>
            {saving ? <><span className="spin" aria-hidden="true" />{savingLabel}</> : submitLabel}
          </button>
        </>
      )}
    >
      {serverError && <div className="warnbox" role="alert" style={{ marginBottom: 18 }}>{serverError}</div>}
      <form id={formId} ref={formRef} className="form" style={{ gridTemplateColumns: '1fr' }} noValidate onSubmit={submit}>
        {children}
      </form>
    </Modal>
  );
}
