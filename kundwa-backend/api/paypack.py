import os
import re
import time
import uuid
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

PAYPACK_BASE_URL = "https://payments.paypack.rw/api"

# In-memory token storage for Paypack API access
_token_cache = {
    "access": None,
    "expires_at": 0
}

# In-memory transaction storage for tracking & simulated fallback
_mock_transactions = {}

def _http_request(url: str, method: str = "GET", payload: dict = None, headers: dict = None, timeout: int = 15):
    """
    Standard library HTTP helper - zero external dependencies.
    """
    req_headers = {
        "Accept": "application/json",
        "User-Agent": "Kundwa-Event-Hub/1.0"
    }
    if headers:
        req_headers.update(headers)

    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        req_headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            return resp.getcode(), json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8") if e.fp else ""
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"error": err_body}
        return e.code, parsed
    except Exception as e:
        logger.error(f"HTTP request error to {url}: {e}")
        return 500, {"error": str(e)}

def format_rwanda_phone(phone_input: str) -> str:
    """
    Normalizes any Rwandan phone number input to local 10-digit format (e.g. '0784289407').
    """
    if not phone_input:
        return ""
    cleaned = re.sub(r"[^\d]", "", str(phone_input))

    if cleaned.startswith("250") and len(cleaned) == 12:
        return "0" + cleaned[3:]
    elif cleaned.startswith("0") and len(cleaned) == 10:
        return cleaned
    elif len(cleaned) == 9 and cleaned.startswith("7"):
        return "0" + cleaned
    elif len(cleaned) == 9 and cleaned.startswith("8"):
        return "0" + cleaned
    return cleaned

def get_paypack_credentials():
    client_id = os.environ.get("PAYPACK_CLIENT_ID", "").strip()
    client_secret = os.environ.get("PAYPACK_CLIENT_SECRET", "").strip()
    return client_id, client_secret

def get_paypack_token():
    """
    Obtains and caches a Paypack JWT authentication token.
    """
    client_id, client_secret = get_paypack_credentials()
    if not client_id or not client_secret:
        return None

    now = time.time()
    if _token_cache.get("access") and _token_cache.get("expires_at", 0) > now + 60:
        return _token_cache["access"]

    url = f"{PAYPACK_BASE_URL}/auth/agents/authorize"
    payload = {"client_id": client_id, "client_secret": client_secret}
    status_code, data = _http_request(url, method="POST", payload=payload)

    if status_code in (200, 201) and "access" in data:
        access_token = data.get("access")
        expires_in = data.get("expires", 1800)
        _token_cache["access"] = access_token
        _token_cache["expires_at"] = now + expires_in
        return access_token
    else:
        logger.warning(f"Paypack authorization error: HTTP {status_code} - {data}")
        return None

def initiate_momo_cashin(amount: int, phone: str, metadata: dict = None):
    """
    Initiates a Cashin transaction (USSD push prompt sent to user's phone).
    """
    normalized_phone = format_rwanda_phone(phone)
    token = get_paypack_token()

    # If Paypack live credentials are valid and active
    if token:
        url = f"{PAYPACK_BASE_URL}/transactions/cashin"
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "amount": int(amount),
            "number": normalized_phone
        }
        status_code, data = _http_request(url, method="POST", payload=payload, headers=headers)

        if status_code in (200, 201):
            ref = data.get("ref")
            _mock_transactions[ref] = {
                "ref": ref,
                "status": data.get("status", "pending"),
                "amount": data.get("amount", amount),
                "phone": normalized_phone,
                "created_at": time.time(),
                "mode": "live"
            }
            return {
                "success": True,
                "mode": "live",
                "ref": ref,
                "status": data.get("status", "pending"),
                "amount": data.get("amount", amount),
                "phone": normalized_phone,
                "created_at": data.get("created_at"),
                "message": "Live USSD prompt sent to phone. Check phone screen to enter PIN."
            }
        else:
            logger.warning(f"Paypack cashin returned {status_code}: {data}")
            return _create_fallback_transaction(amount, normalized_phone, f"Paypack API: {data}")
    else:
        # Development / Simulation mode
        return _create_fallback_transaction(amount, normalized_phone)

def _create_fallback_transaction(amount: int, phone: str, error_note: str = None):
    """
    Generates a realistic pending transaction simulation for development or fallback.
    """
    ref = f"PK-{uuid.uuid4().hex[:10].upper()}"
    _mock_transactions[ref] = {
        "ref": ref,
        "status": "pending",
        "amount": amount,
        "phone": phone,
        "created_at": time.time(),
        "error_note": error_note,
        "mode": "simulation"
    }
    return {
        "success": True,
        "mode": "simulation",
        "ref": ref,
        "status": "pending",
        "amount": amount,
        "phone": phone,
        "message": "Payment prompt triggered. Complete with PIN on your phone (or approve below)."
    }

def check_momo_status(ref: str):
    """
    Checks the status of a Paypack transaction by reference.
    """
    if not ref:
        return {"status": "failed", "message": "Reference required"}

    # Check local store first (used for simulation and live ref mapping)
    if ref in _mock_transactions:
        tx = _mock_transactions[ref]
        if tx.get("mode") == "simulation":
            return {
                "ref": ref,
                "status": tx.get("status", "pending"),
                "amount": tx.get("amount"),
                "phone": tx.get("phone"),
                "mode": "simulation"
            }

    token = get_paypack_token()
    if token:
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{PAYPACK_BASE_URL}/transactions/{ref}"
        status_code, data = _http_request(url, method="GET", headers=headers)

        if status_code == 200:
            tx_status = data.get("status", "pending")
            if ref in _mock_transactions:
                _mock_transactions[ref]["status"] = tx_status
            return {
                "ref": ref,
                "status": tx_status,
                "amount": data.get("amount"),
                "phone": data.get("client"),
                "mode": "live"
            }

        # Fallback to events search by ref
        events_url = f"{PAYPACK_BASE_URL}/events/transactions?ref={ref}"
        e_status, e_data = _http_request(events_url, method="GET", headers=headers)
        if e_status == 200 and isinstance(e_data, dict):
            transactions = e_data.get("transactions", [])
            if transactions:
                t = transactions[0]
                t_data = t.get("data", t) if isinstance(t, dict) else {}
                tx_status = t_data.get("status", "pending")
                return {
                    "ref": ref,
                    "status": tx_status,
                    "amount": t_data.get("amount"),
                    "phone": t_data.get("client"),
                    "mode": "live"
                }

    # If in local cache
    if ref in _mock_transactions:
        tx = _mock_transactions[ref]
        return {
            "ref": ref,
            "status": tx.get("status", "pending"),
            "amount": tx.get("amount"),
            "phone": tx.get("phone"),
            "mode": tx.get("mode", "simulation")
        }

    return {"ref": ref, "status": "pending", "mode": "unknown"}

def approve_momo_simulation(ref: str):
    """
    Allows manual or simulation approval of a test transaction.
    """
    _mock_transactions[ref] = {
        "ref": ref,
        "status": "successful",
        "approved_at": time.time()
    }
    return {"ref": ref, "status": "successful", "message": "Transaction approved"}
