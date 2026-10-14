import re
import math
from typing import Tuple

class SMSFormatter:
    # Matches Bangladeshi mobile prefixes (013, 014, 015, 016, 017, 018, 019)
    BD_PHONE_REGEX = re.compile(r"^(?:\+?880|0)?(1[3-9]\d{8})$")

    @classmethod
    def normalize_bd_phone(cls, phone_raw: str, prefix_plus: bool = True) -> str:
        """
        Normalizes any input (e.g., '01711-223344', '8801711223344', '+8801711223344')
        into either '+8801XXXXXXXXX' or '8801XXXXXXXXX'.
        """
        cleaned = re.sub(r"[^\d+]", "", phone_raw.strip())
        match = cls.BD_PHONE_REGEX.match(cleaned)
        if not match:
            raise ValueError(f"Invalid Bangladeshi mobile number: {phone_raw}")
        
        ten_digit = match.group(1)
        return f"+880{ten_digit}" if prefix_plus else f"880{ten_digit}"

    @classmethod
    def calculate_sms_parts(cls, message: str) -> Tuple[bool, int, int]:
        """
        Detects Unicode (Bangla) characters and computes total characters and SMS segment parts.
        Returns: (is_unicode, character_count, parts_count)
        """
        is_unicode = any(ord(char) > 127 for char in message)
        char_count = len(message)

        if is_unicode:
            if char_count <= 70:
                parts = 1
            else:
                parts = math.ceil(char_count / 67)
        else:
            if char_count <= 160:
                parts = 1
            else:
                parts = math.ceil(char_count / 153)

        return is_unicode, char_count, parts
