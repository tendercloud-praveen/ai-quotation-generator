import re


def extract_quantity(text: str) -> int:

    if not text:
        return 1

    match = re.search(r"\b(\d+)\b", text)

    if match:
        return int(match.group(1))

    return 1