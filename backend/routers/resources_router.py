from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import LegalResource, User
from ..schemas import LegalResourceResponse, LegalResourceBase
from ..auth import require_admin

router = APIRouter(prefix="/api/resources", tags=["resources"])

@router.get("/", response_model=List[LegalResourceResponse])
def get_resources(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LegalResource)
    if category and category != "All":
        query = query.filter(LegalResource.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(
            (LegalResource.title.ilike(f"%{search}%")) |
            (LegalResource.summary.ilike(f"%{search}%"))
        )
    return query.order_by(LegalResource.id.asc()).all()

@router.get("/{id}", response_model=LegalResourceResponse)
def get_resource(id: int, db: Session = Depends(get_db)):
    res = db.query(LegalResource).filter(LegalResource.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    return res

@router.put("/{id}", response_model=LegalResourceResponse)
def update_resource(
    id: int,
    data: LegalResourceBase,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    res = db.query(LegalResource).filter(LegalResource.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    res.title = data.title
    res.category = data.category
    res.summary = data.summary
    res.content = data.content
    if data.author:
        res.author = data.author
    if data.read_time:
        res.read_time = data.read_time
    if data.jurisdiction:
        res.jurisdiction = data.jurisdiction
        
    db.commit()
    db.refresh(res)
    return res

@router.post("/", response_model=LegalResourceResponse)
def create_resource(
    data: LegalResourceBase,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    res = LegalResource(
        title=data.title,
        category=data.category,
        summary=data.summary,
        content=data.content,
        author=data.author or "THE LAW GO Editorial",
        read_time=data.read_time or "5 min read",
        jurisdiction=data.jurisdiction or "National / Federal"
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return res

@router.delete("/{id}")
def delete_resource(
    id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    res = db.query(LegalResource).filter(LegalResource.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(res)
    db.commit()
    return {"message": "Resource deleted successfully"}
