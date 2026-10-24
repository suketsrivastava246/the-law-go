from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import HeroSlide, User
from ..schemas import HeroSlideCreate, HeroSlideResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/hero-slides", tags=["Hero Slides"])


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can manage hero slides"
        )
    return current_user


# Public: get all active slides (sorted)
@router.get("/", response_model=List[HeroSlideResponse])
def get_active_slides(db: Session = Depends(get_db)):
    slides = (
        db.query(HeroSlide)
        .filter(HeroSlide.is_active == True)
        .order_by(HeroSlide.sort_order.asc(), HeroSlide.id.asc())
        .all()
    )
    return slides


# Admin: get ALL slides (including inactive)
@router.get("/admin/all", response_model=List[HeroSlideResponse])
def get_all_slides(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(HeroSlide).order_by(HeroSlide.sort_order.asc(), HeroSlide.id.asc()).all()


# Admin: create new slide
@router.post("/", response_model=HeroSlideResponse, status_code=201)
def create_slide(slide: HeroSlideCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    db_slide = HeroSlide(**slide.model_dump())
    db.add(db_slide)
    db.commit()
    db.refresh(db_slide)
    return db_slide


# Admin: update a slide
@router.put("/{slide_id}", response_model=HeroSlideResponse)
def update_slide(slide_id: int, slide: HeroSlideCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    db_slide = db.query(HeroSlide).filter(HeroSlide.id == slide_id).first()
    if not db_slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    for key, value in slide.model_dump().items():
        setattr(db_slide, key, value)
    db.commit()
    db.refresh(db_slide)
    return db_slide


# Admin: delete a slide
@router.delete("/{slide_id}", status_code=204)
def delete_slide(slide_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    db_slide = db.query(HeroSlide).filter(HeroSlide.id == slide_id).first()
    if not db_slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    db.delete(db_slide)
    db.commit()
