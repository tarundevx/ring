from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.db.models import Task
from app.db.session import get_db
from app.schemas.tasks import TaskCreate, TaskPatch, TaskResponse

router = APIRouter(prefix="/tasks")


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> list[TaskResponse]:
    stmt = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    if status:
        stmt = stmt.where(Task.status == status)
    items = db.scalars(stmt).all()
    return [TaskResponse.model_validate(item) for item in items]


@router.post("", response_model=TaskResponse)
def create_task(payload: TaskCreate, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)) -> TaskResponse:
    task = Task(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        priority=payload.priority,
        source_conversation_id=payload.linked_conversation_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
def patch_task(task_id: uuid.UUID, payload: TaskPatch, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)) -> TaskResponse:
    task = db.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    updates = payload.model_dump(exclude_none=True)
    for key, value in updates.items():
        setattr(task, key, value)
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)

