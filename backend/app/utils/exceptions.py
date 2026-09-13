"""
Exception detection utility.

Computes a list of exception flag strings from a participant's responses
and activity settings. Called on registration and on any response update.
"""

from datetime import date, datetime
from typing import Dict, Any, List, Optional


def compute_exceptions(
    responses: Dict[str, Any],
    minimum_age: int = 18,
    safety_shoes_required: bool = False,
) -> List[str]:
    """
    Returns a list of exception flag strings for a given participant's responses.
    """
    exceptions: List[str] = []

    # Parent Permission
    parent_perm = _get(responses, "parent_perm", "parent_permission")
    if parent_perm and parent_perm.strip().lower() == "no":
        exceptions.append("Parent Permission - No")

    # Safety Shoes
    shoes = _get(responses, "safety_shoes")
    if shoes and shoes.strip().lower() == "no":
        exceptions.append("Safety Shoes - No")

    # Availability
    avail = _get(responses, "availability")
    if avail and avail.strip().lower() == "no":
        exceptions.append("Not Available for Complete Period")

    # Age below minimum
    age = _get_age(responses)
    if age is not None and age < minimum_age:
        exceptions.append("Age Below Minimum")

    # WhatsApp number mismatch
    wa = _get(responses, "whatsapp_number")
    wa_confirm = _get(responses, "whatsapp_confirm")
    if wa and wa_confirm and wa.strip() != wa_confirm.strip():
        exceptions.append("WhatsApp Numbers Do Not Match")

    # WhatsApp proof missing
    wa_proof = _get(responses, "whatsapp_proof")
    if not wa_proof or (isinstance(wa_proof, str) and wa_proof.strip() == ""):
        exceptions.append("WhatsApp Proof Missing")

    # Participant and parent mobile same
    parent_mobile = _get(responses, "parent_mobile")
    if wa and parent_mobile and wa.strip() == parent_mobile.strip():
        exceptions.append("Participant & Parent Mobile Same")

    return exceptions


def extract_queryable_fields(responses: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts key fields from the responses JSON blob into a flat dict
    suitable for setting on Participant model columns.
    """
    # Build full name
    surname = _get(responses, "surname") or ""
    first_name = _get(responses, "first_name") or ""
    middle_name = _get(responses, "middle_name") or ""
    parts = [p.strip() for p in [first_name, middle_name, surname] if p.strip()]
    name = " ".join(parts) if parts else None

    age = _get_age(responses)

    return {
        "name": name,
        "whatsapp_number": _get(responses, "whatsapp_number"),
        "college": _get(responses, "college_name"),
        "stream": _get(responses, "stream"),
        "education_year": _get(responses, "year"),
        "dob": _get(responses, "dob"),
        "age": age,
        "parent_permission": _get(responses, "parent_perm", "parent_permission"),
        "safety_shoes": _get(responses, "safety_shoes"),
        "availability": _get(responses, "availability"),
        "prev_experience_crc": _get(responses, "exp_crc"),
        "prev_experience_other": _get(responses, "exp_other"),
        "friend_name": _get(responses, "friend_name"),
        "parent_mobile": _get(responses, "parent_mobile"),
    }


def _get(responses: Dict[str, Any], *keys: str) -> Optional[str]:
    """Get first matching key from responses."""
    for key in keys:
        val = responses.get(key)
        if val is not None:
            return str(val)
    return None


def _get_age(responses: Dict[str, Any]) -> Optional[int]:
    """Calculate age from DOB in responses, or use stored age."""
    dob_str = _get(responses, "dob")
    if dob_str:
        try:
            dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
            today = date.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            return age
        except (ValueError, TypeError):
            pass
    # Fallback to age field
    age_str = _get(responses, "age")
    if age_str:
        try:
            return int(age_str)
        except (ValueError, TypeError):
            pass
    return None
