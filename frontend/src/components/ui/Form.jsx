import React from "react";
import PropTypes from "prop-types";

const cx = (...classes) => classes.filter(Boolean).join(" ");

// =====================
// Form
// =====================
const Form = React.forwardRef(function Form(
  { children, className = "", onSubmit, ...props },
  ref
) {
  return (
    <form
      ref={ref}
      className={cx("space-y-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
});

// =====================
// Form.Group
// =====================
const FormGroup = React.forwardRef(function FormGroup(
  { children, className = "", ...props },
  ref
) {
  return (
    <div ref={ref} className={cx("space-y-2", className)} {...props}>
      {children}
    </div>
  );
});

// =====================
// Form.Label
// =====================
const Label = React.forwardRef(function Label(
  { htmlFor, children, className = "", required = false, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cx("block text-sm font-medium text-gray-700 dark:text-gray-300", className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
});

// =====================
// Form.Input
// =====================
const Input = React.forwardRef(function Input(
  {
    id,
    name,
    type = "text",
    placeholder = "",
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    className = "",
    helperText,
    ...props
  },
  ref
) {
  const errorId = error ? `${id || name}-error` : undefined;
  const helperId = helperText ? `${id || name}-help` : undefined;

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={cx(errorId, helperId) || undefined}
        className={cx(
          "block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm",
          "focus:ring-primary-500 focus:border-primary-500",
          "dark:bg-gray-700 dark:text-white",
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600",
          disabled && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed",
          className
        )}
        placeholder={placeholder}
        {...props}
      />

      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

// =====================
// Form.Textarea
// =====================
const Textarea = React.forwardRef(function Textarea(
  {
    id,
    name,
    placeholder = "",
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    rows = 3,
    className = "",
    helperText,
    ...props
  },
  ref
) {
  const errorId = error ? `${id || name}-error` : undefined;
  const helperId = helperText ? `${id || name}-help` : undefined;

  return (
    <div>
      <textarea
        ref={ref}
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={cx(errorId, helperId) || undefined}
        className={cx(
          "block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm",
          "focus:ring-primary-500 focus:border-primary-500",
          "dark:bg-gray-700 dark:text-white",
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600",
          disabled && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed",
          className
        )}
        placeholder={placeholder}
        {...props}
      />

      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

// =====================
// Form.Select
// =====================
const Select = React.forwardRef(function Select(
  {
    id,
    name,
    value,
    onChange,
    onBlur,
    options = [],
    error,
    disabled = false,
    className = "",
    helperText,
    ...props
  },
  ref
) {
  const errorId = error ? `${id || name}-error` : undefined;
  const helperId = helperText ? `${id || name}-help` : undefined;

  return (
    <div>
      <select
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={cx(errorId, helperId) || undefined}
        className={cx(
          "block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm",
          "focus:ring-primary-500 focus:border-primary-500",
          "dark:bg-gray-700 dark:text-white",
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600",
          disabled && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option
            key={String(option.value ?? option.label)}
            value={option.value ?? option.label}
          >
            {option.label}
          </option>
        ))}
      </select>

      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

// =====================
// Form.Checkbox
// =====================
const Checkbox = React.forwardRef(function Checkbox(
  {
    id,
    name,
    label,
    checked,
    onChange,
    onBlur,
    error,
    disabled = false,
    className = "",
    ...props
  },
  ref
) {
  const errorId = error ? `${id || name}-error` : undefined;

  return (
    <div>
      <div className="flex items-center">
        <input
          ref={ref}
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cx(
            "h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded",
            disabled && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cx(
            "ml-2 block text-sm text-gray-700 dark:text-gray-300",
            disabled && "text-gray-400 dark:text-gray-500"
          )}
        >
          {label}
        </label>
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

// =====================
// Form.Actions
// =====================
const FormActions = React.forwardRef(function FormActions(
  { children, className = "", ...props },
  ref
) {
  return (
    <div ref={ref} className={cx("flex justify-end space-x-3", className)} {...props}>
      {children}
    </div>
  );
});

// Attach subcomponents
Form.Group = FormGroup;
Form.Label = Label;
Form.Input = Input;
Form.Textarea = Textarea;
Form.Select = Select;
Form.Checkbox = Checkbox;
Form.Actions = FormActions;

// PropTypes
Form.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onSubmit: PropTypes.func,
};

FormGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Label.propTypes = {
  htmlFor: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  required: PropTypes.bool,
};

Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  helperText: PropTypes.string,
};

Textarea.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string,
  helperText: PropTypes.string,
};

Select.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any,
      label: PropTypes.string.isRequired,
    })
  ),
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  helperText: PropTypes.string,
};

Checkbox.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

FormActions.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Form;
