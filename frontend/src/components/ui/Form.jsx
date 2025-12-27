import React from 'react';
import PropTypes from 'prop-types';

const Form = ({ children, className = '', onSubmit, ...props }) => (
  <form className={`space-y-6 ${className}`} onSubmit={onSubmit} {...props}>
    {children}
  </form>
);

const FormGroup = ({ children, className = '', ...props }) => (
  <div className={`space-y-2 ${className}`} {...props}>
    {children}
  </div>
);

const Label = ({ htmlFor, children, className = '', required = false, ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const Input = ({
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  className = '',
  ...props
}) => (
  <div className="relative">
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={`block w-full px-3 py-2 border ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
        disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
      } ${className}`}
      placeholder={placeholder}
      {...props}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

const Textarea = ({
  id,
  name,
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  rows = 3,
  className = '',
  ...props
}) => (
  <div>
    <textarea
      id={id}
      name={name}
      rows={rows}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={`block w-full px-3 py-2 border ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
        disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
      } ${className}`}
      placeholder={placeholder}
      {...props}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

const Select = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  disabled = false,
  className = '',
  ...props
}) => (
  <div>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={`block w-full px-3 py-2 border ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
        disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

const Checkbox = ({
  id,
  name,
  label,
  checked,
  onChange,
  onBlur,
  error,
  disabled = false,
  className = '',
  ...props
}) => (
  <div className="flex items-center">
    <input
      id={id}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${
        disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    />
    <label
      htmlFor={id}
      className={`ml-2 block text-sm text-gray-700 dark:text-gray-300 ${
        disabled ? 'text-gray-400 dark:text-gray-500' : ''
      }`}
    >
      {label}
    </label>
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

const FormActions = ({ children, className = '', ...props }) => (
  <div className={`flex justify-end space-x-3 ${className}`} {...props}>
    {children}
  </div>
);

Form.Group = FormGroup;
Form.Label = Label;
Form.Input = Input;
Form.Textarea = Textarea;
Form.Select = Select;
Form.Checkbox = Checkbox;
Form.Actions = FormActions;

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
};

Select.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
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
