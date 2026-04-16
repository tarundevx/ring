
import uuid
from datetime import datetime
from sqlalchemy import select
from app.db.session import SessionLocal
from app.db.models import Conversation
from app.schemas.conversations import ConversationResponse
import json

def test_db():
    db = SessionLocal()
    try:
        items = db.scalars(select(Conversation)).all()
        print(f"Found {len(items)} conversations")
        for item in items:
            try:
                # Test mapping to Pydantic
                pydantic_item = ConversationResponse.model_validate(item)
                print(f"Validated ID: {pydantic_item.id}")
                print(f"Tags: {pydantic_item.tags} (Type: {type(pydantic_item.tags)})")
            except Exception as e:
                print(f"Validation failed for ID {item.id}: {e}")
                print(f"Raw tags value: {item.tags} (Type: {type(item.tags)})")
    except Exception as e:
        print(f"DB error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_db()
