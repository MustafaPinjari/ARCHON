---
name: django-api-engineering
description: Guides Django 6 and Django REST Framework architecture, thin views, domain service isolation, serializers, and API testing.
---

# Django & API Engineering Skill

## Purpose
This skill establishes best practices for building robust, scalable REST APIs using Django 6 and Django REST Framework (DRF) in ARCHON. It enforces clean architecture: keeping views thin, domain logic in services, and serialization strictly validated.

## Activation Criteria
Activate this skill whenever:
- Adding or modifying REST API endpoints in `api/`.
- Creating or updating serializers in `api/serializers.py`.
- Adding models or database migrations.
- Writing integration tests for API endpoints (`tests/test_api_endpoints.py`).

## Required Tools
- `view_file` / `replace_file_content` / `write_to_file`: Edit API endpoints, serializers, and models.
- `run_command`: Run `manage.py check`, `manage.py makemigrations`, and `pytest`.

## Architectural Guidelines
1. **Thin Views, Rich Domain Services:**
   - DRF Views (`APIView`, `ViewSet`) must ONLY handle:
     1. Authenticating & authorizing the request.
     2. Deserializing & validating input payloads.
     3. Invoking a decoupled domain service (`archon/core/...`).
     4. Returning standardized JSON HTTP responses.
   - Never put AST parsing, Git subprocess execution, or Cypher queries directly inside view methods.
2. **Standardized Response Envelope:**
   - Success: `{"success": true, "data": {...}}` with HTTP 200/201.
   - Error: `{"success": false, "error": {"code": "INVALID_PATH", "message": "..."}}` with HTTP 400/404/500.
3. **Transaction Safety:**
   - Wrap multi-table operations or database writes in `with transaction.atomic():`.
4. **Input Sanitization:**
   - DRF serializers must validate repository paths against filesystem traversal attacks (`os.path.realpath` / `Path.resolve()`).

## Step-by-Step Procedure
1. **Define Schema & Serializer:**
   - Create typed DRF serializer in `api/serializers.py` with explicit field validation.
2. **Implement View Controller:**
   - Implement thin view in `api/views.py` calling the corresponding `archon/core` service.
3. **Configure URL Routing:**
   - Register route in `api/urls.py` under the versioned prefix `/api/v1/`.
4. **Write Integration Test:**
   - Add API test in `tests/test_api_endpoints.py` using `APIClient` or `requests`.
   - Assert both 200 OK and 400 Bad Request error cases.
5. **Execute Validation:**
   - Run `.\.venv\Scripts\python.exe -m pytest tests/test_api_endpoints.py`.

## Verification Criteria
- [ ] Views contain 0 lines of raw AST parsing or direct Git execution.
- [ ] Input parameters are validated via DRF serializer.
- [ ] Automated API tests pass with status code assertions.
- [ ] CORS settings allow access from `http://localhost:3000`.

## Failure Handling
- If a serializer fails validation, return HTTP 400 with structured field errors.
- If a target repository path does not exist, return HTTP 404 with a clear error code instead of an unhandled Python exception.

## Expected Deliverables
- DRF Serializer, View, and URL route.
- Corresponding automated test in `tests/test_api_endpoints.py`.
