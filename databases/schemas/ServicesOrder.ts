export const ServicesOrderSchema = {
  name: "ServicesOrdersList",
  properties: {
    id: "int",
    identifier: "string",
    status: "string",
    service_date: "string",
    // arrival_string: 'string',
    // so_type: 'string',
    // cancellation_reason: 'string',
    customer_id: "int?",
    customer: { type: "object", objectType: "customer" },
    address: { type: "object", objectType: "address" },
    contact: { type: "object", objectType: "contact" },
    observations: "string?",
    created_at: "string?",
    vehicle: { type: "object", objectType: "vehicle" },
    employee: { type: "list", objectType: "employee" },
    voyage: { type: "object", objectType: "voyage" },
    service_executions: { type: "list", objectType: "services" },
    driver_observations: "string?",
    // reschedules: {type: 'list', objectType: 'string'},
    // service_executions: {type: 'object', objectType: 'servicesExecutions'},
  },
  primaryKey: "id",
}

export const CustomerSchema = {
  name: "customer",
  properties: {
    name: "string",
    business_name: "string?",
    document_value: "string?",
  },
}

export const AddressSchema = {
  name: "address",
  properties: {
    name: "string?",
    to_s: "string?",
    neighborhood: "string?",
    latitude: "string?",
    longitude: "string?",
    street: "string?",
    number: "string?",
    complement: "string?",
    address_location: { type: "object", objectType: "address_location" },
    landmark: "string?",
  },
}

export const AddressLocation = {
  name: "address_location",
  properties: {
    name: "string?",
    state_abbreviation: "string?",
  },
}

export const ContactSchema = {
  name: "contact",
  properties: {
    name: "string?",
    position: "string?",
    telephone: "string?",
  },
}

export const VehicleSchema = {
  name: "vehicle",
  properties: {
    model: "string?",
    registration_plate: "string?",
    vehicle_manufacturer: { type: "object", objectType: "vehicle_manufacturer" },
    capacity: "string?",
  },
}

export const VehicleManufacturerSchema = {
  name: "vehicle_manufacturer",
  properties: {
    name: "string?",
  },
}

export const EmployeeSchema = {
  name: "employee",
  properties: {
    id: "int",
    cpf: "string?",
    name: "string?",
    phone_number: "string?",
    created_at: "string?",
    upstringd_at: "string?",
    position_id: "int?",
    vendor_id: "string?",
    deleted_at: "string?",
    active: "bool?",
    position: { type: "object", objectType: "options" },
  },
}

export const VoyageSchema = {
  name: "voyage",
  properties: {
    id: "int",
    created_at: "string?",
    deleted_at: "string?",
    name: "string?",
    updated_at: "string?",
  },
}

export const ServicesSchema = {
  name: "services",
  properties: {
    service: { type: "object", objectType: "service" },
    unit: { type: "object", objectType: "options" },
    amount: "int",
    service_item_weights: "string?",
  },
}

export const ServiceSchema = {
  name: "service",
  properties: {
    id: "int",
    name: "string?",
    mtr_tipo_acondicionamento: "string?",
    service_items: { type: "list", objectType: "serviceItems" },
  },
}

export const ServiceItemsSchema = {
  name: "serviceItems",
  properties: {
    id: "int",
    name: "string?",
  },
}

export const OptionsSchema = {
  name: "options",
  properties: {
    id: "int",
    name: "string?",
  },
}
