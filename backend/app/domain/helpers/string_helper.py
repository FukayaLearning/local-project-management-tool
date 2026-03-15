import re


PROHIBITED_CHARS_PATTERN = re.compile(r'[<>:"/\\|?*\x00-\x1f]')


def validate_project_name(name: str) -> str:
    """Validate and return trimmed project name. Raises ValueError if invalid. Spaces are replaced by underscores."""
    trimmed = name.strip()
    if not trimmed:
        raise ValueError("Project name cannot be empty.")
        
    trimmed = re.sub(r'\s+', '_', trimmed)
    
    if PROHIBITED_CHARS_PATTERN.search(trimmed):
        raise ValueError(
            f"Project name contains prohibited characters: {trimmed}"
        )
    if trimmed.startswith("."):
        raise ValueError("Project name cannot start with a dot.")
    return trimmed
