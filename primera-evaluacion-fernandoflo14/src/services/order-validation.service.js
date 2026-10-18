function isValidDate(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateOrderBody(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return ['El cuerpo de la solicitud es obligatorio'];
  }

  if (
    typeof body.customer_id !== 'string' ||
    body.customer_id.trim().length === 0
  ) {
    errors.push('customer_id es obligatorio');
  }

  if (
    !Number.isInteger(Number(body.employee_id)) ||
    Number(body.employee_id) <= 0
  ) {
    errors.push('employee_id debe ser un número válido');
  }

  if (!isValidDate(body.order_date)) {
    errors.push('order_date debe tener formato YYYY-MM-DD y ser una fecha válida');
  }

  if (
    body.required_date !== undefined &&
    body.required_date !== null &&
    !isValidDate(body.required_date)
  ) {
    errors.push('required_date debe tener formato YYYY-MM-DD');
  }

  if (!Array.isArray(body.products) || body.products.length === 0) {
    errors.push('La orden debe contener al menos un producto');
    return errors;
  }

  const validProductIds = [];

  body.products.forEach((item, index) => {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);

    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      productId > 32767
    ) {
      errors.push(`products[${index}].product_id debe ser válido`);
    } else {
      validProductIds.push(productId);
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 32767
    ) {
      errors.push(
        `products[${index}].quantity debe ser mayor a cero`
      );
    }

    if (
      item.discount !== undefined &&
      (
        Number.isNaN(Number(item.discount)) ||
        Number(item.discount) < 0 ||
        Number(item.discount) > 1
      )
    ) {
      errors.push(
        `products[${index}].discount debe estar entre 0 y 1`
      );
    }
  });

  if (new Set(validProductIds).size !== validProductIds.length) {
    errors.push('No se permiten productos duplicados en la orden');
  }

  return errors;
}

module.exports = {
  validateOrderBody,
};