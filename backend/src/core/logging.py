import logging
import sys

from .config import get_settings

settings = get_settings()


def setup_logging() -> None:
    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    fmt = "%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"
    logging.basicConfig(level=level, format=fmt, stream=sys.stdout, force=True)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
