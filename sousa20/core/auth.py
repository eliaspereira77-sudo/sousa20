import hmac
import os
from functools import wraps

from flask import jsonify, request


def _configured_token():
    return os.getenv("SOUSA_AUTH_TOKEN")


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        expected = _configured_token()

        if not expected:
            return jsonify({
                "error": "SOUSA_AUTH_TOKEN not configured"
            }), 503

        authorization = request.headers.get("Authorization", "")
        scheme, _, token = authorization.partition(" ")

        if (
            scheme.lower() != "bearer"
            or not token
            or not hmac.compare_digest(token, expected)
        ):
            return jsonify({
                "error": "Unauthorized"
            }), 401

        return fn(*args, **kwargs)

    return wrapper