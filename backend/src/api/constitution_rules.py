import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..core.database import get_db
from ..models.constitution_rules import ConstitutionRule

router = APIRouter(prefix="/v1/constitution-rules", tags=["constitution-rules"])


class RuleCreate(BaseModel):
    rule_type: str
    rule_key: str
    rule_value: dict
    description: str | None = None


class RuleUpdate(BaseModel):
    rule_value: dict | None = None
    description: str | None = None


class RuleResponse(BaseModel):
    id: str
    rule_type: str
    rule_key: str
    rule_value: dict
    description: str | None
    version: int
    effective_at: str
    expired_at: str | None
    created_at: str


@router.get("", response_model=dict)
async def list_rules(rule_type: str | None = None, db: AsyncSession = Depends(get_db)):
    query = select(ConstitutionRule).where(ConstitutionRule.expired_at.is_(None))
    if rule_type:
        query = query.where(ConstitutionRule.rule_type == rule_type)
    result = await db.execute(query)
    rules = result.scalars().all()
    return {"items": [{ "id": str(r.id), "rule_type": r.rule_type, "rule_key": r.rule_key, "rule_value": r.rule_value, "description": r.description, "version": r.version, "effective_at": r.effective_at.isoformat() if r.effective_at else None, "expired_at": r.expired_at.isoformat() if r.expired_at else None, "created_at": r.created_at.isoformat() if r.created_at else None } for r in rules]}


@router.post("", status_code=201, response_model=dict)
async def create_rule(body: RuleCreate, db: AsyncSession = Depends(get_db)):
    rule = ConstitutionRule(rule_type=body.rule_type, rule_key=body.rule_key, rule_value=body.rule_value, description=body.description, version=1, effective_at=datetime.now(timezone.utc))
    db.add(rule)
    await db.flush()
    return {"id": str(rule.id), "version": rule.version}


@router.patch("/{rule_id}", response_model=dict)
async def update_rule(rule_id: str, body: RuleUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ConstitutionRule).where(ConstitutionRule.id == uuid.UUID(rule_id), ConstitutionRule.expired_at.is_(None)))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="規則不存在")
    rule.expired_at = datetime.now(timezone.utc)
    new_rule = ConstitutionRule(rule_type=rule.rule_type, rule_key=rule.rule_key, rule_value=body.rule_value or rule.rule_value, description=body.description or rule.description, version=rule.version + 1, effective_at=datetime.now(timezone.utc))
    db.add(new_rule)
    await db.flush()
    return {"id": str(new_rule.id), "version": new_rule.version}


@router.delete("/{rule_id}", response_model=dict)
async def delete_rule(rule_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ConstitutionRule).where(ConstitutionRule.id == uuid.UUID(rule_id)))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="規則不存在")
    rule.expired_at = datetime.now(timezone.utc)
    await db.flush()
    return {"id": str(rule.id), "expired_at": rule.expired_at.isoformat()}
