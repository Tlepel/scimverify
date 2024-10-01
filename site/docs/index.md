# Documentation

SCIM Verify is a highly configurable testing framework for SCIM APIs. While it works out-of-the-box with sensible defaults, you can customize its behavior extensively through a YAML configuration file to match your specific implementation requirements. This documentation explains all available configuration options.

## Global Configuration

The global configuration settings control the overall behavior of the testing framework.

```yaml
detectSchema: true           # Enables automatic schema detection from responses
detectResourceTypes: true    # Enables automatic resource type detection
```

## User Operations

Configuration for testing the Users endpoint in a SCIM API.

```yaml
users:
  enabled: true              # Enable testing of user operations
  operations:                # HTTP methods to test
    - GET
    - POST
    - PUT
    - PATCH
    - DELETE
  sortAttributes:            # Attributes to sort by when retrieving users
    - userName
```

### Filter Tests

Tests for filtering users using SCIM filter expressions.

```yaml
  filter_tests:
    - filter: userName eq "bjensen"    # Filter expression to test
      user_schema:                     # Schema to validate response against
        type: object
        properties:
          schemas:
            type: array
            items:
              type: string
            contains:
              const: urn:ietf:params:scim:schemas:core:2.0:User
          userName:
            type: string
            const: bjensen
        required:
          - userName
          - schemas
        additionalProperties: true
```

### POST Tests

Tests for creating users via POST requests.

```yaml
  post_tests:
    - request:                         # Request payload
        schemas:
          - urn:ietf:params:scim:schemas:core:2.0:User
        userName: barbara jensen
        emails:
          - value: barbara.jensen@example.com
      response:                        # Expected response schema
        type: object
        properties:
          schemas:
            type: array
            items:
              type: string
            contains:
              const: urn:ietf:params:scim:schemas:core:2.0:User
          userName:
            type: string
            const: barbara jensen
        required:
          - userName
          - schemas
        additionalProperties: true
    - request:                         # Another test case
        schemas:
          - urn:ietf:params:scim:schemas:core:2.0:User
        userName: testuser6238
        emails:
          - value: barbara.jensen@example.com
      response:
        type: object
        properties:
          schemas:
            type: array
            items:
              type: string
            contains:
              const: urn:ietf:params:scim:schemas:core:2.0:User
          userName:
            type: string
            const: testuser6238
          emails:
            type: array
            items:
              type: object
              properties:
                value:
                  type: string
                  const: barbara.jensen@example.com
        required:
          - userName
          - schemas
          - emails
        additionalProperties: true
```

### PUT Tests

Tests for updating users via PUT requests.

```yaml
  put_tests:
    - id: AUTO                         # AUTO indicates ID will be determined at runtime
      request:
        schemas:
          - urn:ietf:params:scim:schemas:core:2.0:User
        userName: testuser6238
        emails:
          - value: barbara.jensen@example.com
      response:
        type: object
        properties:
          schemas:
            type: array
            items:
              type: string
            contains:
              const: urn:ietf:params:scim:schemas:core:2.0:User
          userName:
            type: string
            const: testuser6238
          emails:
            type: array
            items:
              type: object
              properties:
                value:
                  type: string
                  const: barbara.jensen@example.com
        required:
          - userName
          - schemas
          - emails
        additionalProperties: true
```

### PATCH Tests

Tests for partial updates via PATCH requests.

```yaml
  patch_tests:
    - id: AUTO
      request:
        schemas:
          - urn:ietf:params:scim:api:messages:2.0:PatchOp
        Operations:
          - op: replace
            path: userName
            value: JohnDoe
      response:
        type: object
        properties:
          schemas:
            type: array
            items:
              type: string
            contains:
              const: urn:ietf:params:scim:schemas:core:2.0:User
          userName:
            type: string
            const: JohnDoe
        required:
          - userName
          - schemas
        additionalProperties: true
```

### DELETE Tests

Tests for deleting users.

```yaml
  delete_tests:
    - id: AUTO                         # AUTO indicates ID will be determined at runtime
```

## Group Operations

Configuration for testing the Groups endpoint in a SCIM API.

```yaml
groups:
  enabled: true                        # Enable testing of group operations
  operations:                          # HTTP methods to test
    - GET
    - POST
    - PUT
    - PATCH
    - DELETE
  sortAttributes:                      # Attributes to sort by when retrieving groups
    - displayName
```

### Group POST Tests

Tests for creating groups via POST requests.

```yaml
  post_tests:
    - request:
        schemas:
          - urn:ietf:params:scim:schemas:core:2.0:Group
        displayName: TestGroup
      response:
        type: object
        properties:
          schemas:
            type: array
            items:
              type: string
            contains:
              const: urn:ietf:params:scim:schemas:core:2.0:Group
          displayName:
            type: string
            const: TestGroup
        required:
          - displayName
          - schemas
        additionalProperties: true
    - request:                         # Group with members
        schemas:
          - urn:ietf:params:scim:schemas:core:2.0:Group
        displayName: Engineering
        members:
          - value: AUTO                # Member ID will be determined at runtime
      response:
        type: object
        properties:
          schemas:
            type: array
            items:
              type: string
            contains:
              const: urn:ietf:params:scim:schemas:core:2.0:Group
          displayName:
            type: string
            const: Engineering
          members:
            type: array
            items:
              type: object
              properties:
                value:
                  type: string
        required:
          - displayName
          - schemas
          - members
        additionalProperties: true
```

### Group PUT Tests

Tests for updating groups via PUT requests.

```yaml
  put_tests:
    - id: AUTO
      request:
        schemas:
          - urn:ietf:params:scim:schemas:core:2.0:Group
        displayName: UpdatedGroup
        members:
          - value: AUTO
      response:
        type: object
        properties:
          schemas:
            type: array
            items:
              type: string
            contains:
              const: urn:ietf:params:scim:schemas:core:2.0:Group
          displayName:
            type: string
            const: UpdatedGroup
          members:
            type: array
            items:
              type: object
              properties:
                value:
                  type: string
        required:
          - displayName
          - schemas
          - members
        additionalProperties: true
```

### Group PATCH Tests

Tests for partial updates to groups via PATCH requests.

```yaml
  patch_tests:
    - id: AUTO
      request:
        schemas:
          - urn:ietf:params:scim:api:messages:2.0:PatchOp
        Operations:
          - op: replace
            path: displayName
            value: NewGroupName
      response:
        type: object
        properties:
          schemas:
            type: array
            items:
              type: string
            contains:
              const: urn:ietf:params:scim:schemas:core:2.0:Group
          displayName:
            type: string
            const: NewGroupName
        required:
          - displayName
          - schemas
        additionalProperties: true
```

### Group DELETE Tests

Tests for deleting groups.

```yaml
  delete_tests:
    - id: AUTO                         # AUTO indicates ID will be determined at runtime

