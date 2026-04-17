from __future__ import annotations

import os

import uvicorn

from app.core.config import settings


def main() -> None:
    port = int(os.getenv("PORT", "10000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    main()
