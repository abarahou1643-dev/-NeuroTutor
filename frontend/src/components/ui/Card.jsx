import React from "react";
import PropTypes from "prop-types";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const Card = React.forwardRef(function Card(
  { children, className = "", hoverable = false, ...props },
  ref
) {
  const baseStyles =
    "bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden transition-all duration-200";
  const hoverStyles = hoverable ? "hover:shadow-card-hover hover:-translate-y-1" : "";

  return (
    <div ref={ref} className={cx(baseStyles, hoverStyles, className)} {...props}>
      {children}
    </div>
  );
});

const CardHeader = React.forwardRef(function CardHeader(
  { children, className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("px-6 py-4 border-b border-gray-100 dark:border-gray-700", className)}
      {...props}
    >
      {children}
    </div>
  );
});

const CardTitle = React.forwardRef(function CardTitle(
  { children, className = "", as: Component = "h3", ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={cx("text-lg font-semibold text-gray-900 dark:text-white", className)}
      {...props}
    >
      {children}
    </Component>
  );
});

const CardBody = React.forwardRef(function CardBody(
  { children, className = "", ...props },
  ref
) {
  return (
    <div ref={ref} className={cx("p-6", className)} {...props}>
      {children}
    </div>
  );
});

const CardFooter = React.forwardRef(function CardFooter(
  { children, className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("px-6 py-4 bg-gray-50 dark:bg-gray-700/50", className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hoverable: PropTypes.bool,
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
