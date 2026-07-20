// Field-level validation helpers used by signup, login, and user management.
// Pure functions so they stay easy to test and reuse in Part 2.

export function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// Exactly 10 digits, no spaces or symbols.
export function isValidMobile(mobile) {
  return /^\d{10}$/.test(String(mobile).trim());
}

// Strong password: min 8 chars, at least one uppercase, one lowercase,
// one digit, and one special character.
export function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
    String(password)
  );
}

export function passwordsMatch(a, b) {
  return a === b;
}

// Returns a map of fieldName -> error message. Empty object means valid.
export function validateSignupForm({
  companyName,
  fullName,
  email,
  mobile,
  password,
  confirmPassword,
}) {
  const errors = {};
  if (!isNonEmpty(companyName)) errors.companyName = "Company name is required.";
  if (!isNonEmpty(fullName)) errors.fullName = "Full name is required.";
  if (!isNonEmpty(email)) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isNonEmpty(mobile)) errors.mobile = "Mobile number is required.";
  else if (!isValidMobile(mobile))
    errors.mobile = "Mobile number must be exactly 10 digits.";
  if (!isNonEmpty(password)) errors.password = "Password is required.";
  else if (!isStrongPassword(password))
    errors.password =
      "Password must be 8+ chars with uppercase, lowercase, number, and special character.";
  if (!isNonEmpty(confirmPassword))
    errors.confirmPassword = "Please confirm your password.";
  else if (!passwordsMatch(password, confirmPassword))
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

// Validation for the Add/Edit User modal (Manager / Sales Rep).
// In edit mode the password is optional — leaving it blank keeps the
// existing password. When a new password is provided it must be strong
// and match the confirmation.
export function validateUserForm(
  { fullName, email, mobile, password, confirmPassword },
  { isEdit = false } = {}
) {
  const errors = {};
  if (!isNonEmpty(fullName)) errors.fullName = "Full name is required.";
  if (!isNonEmpty(email)) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isNonEmpty(mobile)) errors.mobile = "Mobile number is required.";
  else if (!isValidMobile(mobile))
    errors.mobile = "Mobile number must be exactly 10 digits.";
  if (isEdit) {
    if (isNonEmpty(password)) {
      if (!isStrongPassword(password))
        errors.password =
          "Password must be 8+ chars with uppercase, lowercase, number, and special character.";
      else if (!isNonEmpty(confirmPassword))
        errors.confirmPassword = "Please confirm your password.";
      else if (!passwordsMatch(password, confirmPassword))
        errors.confirmPassword = "Passwords do not match.";
    } else if (isNonEmpty(confirmPassword)) {
      errors.confirmPassword = "Enter the new password first.";
    }
  } else {
    if (!isNonEmpty(password)) errors.password = "Password is required.";
    else if (!isStrongPassword(password))
      errors.password =
        "Password must be 8+ chars with uppercase, lowercase, number, and special character.";
    if (!isNonEmpty(confirmPassword))
      errors.confirmPassword = "Please confirm your password.";
    else if (!passwordsMatch(password, confirmPassword))
      errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!isNonEmpty(email)) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isNonEmpty(password)) errors.password = "Password is required.";
  return errors;
}

// Validation for the Add/Edit Product modal.
export function validateProductForm(form, { isEdit = false } = {}) {
  void isEdit;
  const errors = {};
  if (!isNonEmpty(form.productName))
    errors.productName = "Product name is required.";
  if (!isNonEmpty(form.productCode))
    errors.productCode = "Product code is required.";
  if (!isNonEmpty(form.category)) errors.category = "Category is required.";

  if (form.costPrice === "" || form.costPrice == null) {
    errors.costPrice = "Cost price is required.";
  } else if (Number(form.costPrice) <= 0 || Number.isNaN(Number(form.costPrice))) {
    errors.costPrice = "Cost price must be greater than 0.";
  }

  if (form.sellingPrice === "" || form.sellingPrice == null) {
    errors.sellingPrice = "Selling price is required.";
  } else if (Number.isNaN(Number(form.sellingPrice))) {
    errors.sellingPrice = "Enter a valid selling price.";
  } else if (Number(form.sellingPrice) < Number(form.costPrice)) {
    errors.sellingPrice = "Selling price must be greater than or equal to cost price.";
  }

  if (
    form.stockQuantity !== "" &&
    form.stockQuantity != null &&
    (Number.isNaN(Number(form.stockQuantity)) || Number(form.stockQuantity) < 0)
  ) {
    errors.stockQuantity = "Stock quantity must be 0 or greater.";
  }

  if (
    form.gstPercentage !== "" &&
    form.gstPercentage != null &&
    (Number.isNaN(Number(form.gstPercentage)) || Number(form.gstPercentage) < 0)
  ) {
    errors.gstPercentage = "GST percentage must be 0 or greater.";
  }

  return errors;
}

// Validation for the Add/Edit Customer modal.
export function validateCustomerForm(form) {
  const errors = {};
  if (!isNonEmpty(form.customerName))
    errors.customerName = "Customer name is required.";
  if (!isNonEmpty(form.contactPerson))
    errors.contactPerson = "Contact person is required.";
  if (!isNonEmpty(form.companyName))
    errors.companyName = "Company name is required.";

  if (!isNonEmpty(form.mobile)) {
    errors.mobile = "Mobile number is required.";
  } else if (!isValidMobile(form.mobile)) {
    errors.mobile = "Enter a valid mobile number.";
  }

  if (isNonEmpty(form.email) && !isValidEmail(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

// Validation for the Add/Edit Inquiry modal.
export function validateInquiryForm(form) {
  const errors = {};
  if (!isNonEmpty(form.customerId))
    errors.customerId = "Customer is required.";
  if (!isNonEmpty(form.productId))
    errors.productId = "Product is required.";
  if (!isNonEmpty(form.inquiryDate))
    errors.inquiryDate = "Inquiry date is required.";

  if (form.quantity === "" || form.quantity == null) {
    errors.quantity = "Quantity is required.";
  } else if (Number.isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
    errors.quantity = "Quantity must be greater than zero.";
  }

  if (
    form.expectedPrice !== "" &&
    form.expectedPrice != null &&
    (Number.isNaN(Number(form.expectedPrice)) || Number(form.expectedPrice) < 0)
  ) {
    errors.expectedPrice = "Expected price must be 0 or greater.";
  }

  return errors;
}
