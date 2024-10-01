# Limitations in SCIM Discovery

## Schema Discovery Constraints

SCIM's `/Schemas` and `/ResourceTypes` endpoints provide detailed structural information about the data model. However, SCIM does not provide a mechanism to discover all information required for automated integrations and, in consequence, automated tested.

- No discovery mechanism for what operation are allowed per resource type (GET, POST, PATCH etc)
- No validation rules for attribute values (permitted formats, ranges, or enumerations)
- No discovery mechanism for required vs optional attributes in specific operations.
