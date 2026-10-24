from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import LawyerProfile, User, Role, Appointment
from ..schemas import LawyerProfileResponse
from ..auth import require_admin

router = APIRouter(prefix="/api/lawyers", tags=["lawyers"])

@router.get("/", response_model=List[LawyerProfileResponse])
def get_lawyers(specialization: str = None, location: str = None, db: Session = Depends(get_db)):
    query = db.query(LawyerProfile).filter(LawyerProfile.is_verified == True)
    
    if specialization:
        query = query.filter(LawyerProfile.specialization.ilike(f"%{specialization}%"))
    if location:
        query = query.filter(LawyerProfile.location.ilike(f"%{location}%"))
        
    return query.all()

@router.get("/admin/all", response_model=List[LawyerProfileResponse])
def get_all_lawyers_for_admin(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Admin endpoint to see all registered lawyers (both verified and pending)"""
    return db.query(LawyerProfile).order_by(LawyerProfile.id.desc()).all()

@router.get("/{id}", response_model=LawyerProfileResponse)
def get_lawyer(id: int, db: Session = Depends(get_db)):
    lawyer = db.query(LawyerProfile).filter(LawyerProfile.id == id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    return lawyer

# Admin only endpoints
@router.post("/{id}/verify")
def verify_lawyer(id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    lawyer = db.query(LawyerProfile).filter(LawyerProfile.id == id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    
    lawyer.is_verified = True
    db.commit()
    return {"message": "Lawyer verified successfully"}

@router.delete("/{id}")
def delete_lawyer(id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    lawyer = db.query(LawyerProfile).filter(LawyerProfile.id == id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    
    user_id = lawyer.user_id
    
    # Safely detach or cancel any appointments connected to this lawyer
    db.query(Appointment).filter(Appointment.lawyer_id == user_id).update({
        Appointment.lawyer_id: None,
        Appointment.status: "cancelled"
    })
    
    # Delete the lawyer profile
    db.delete(lawyer)
    
    # Delete or deactivate the user account
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        
    db.commit()
    return {"message": "Lawyer profile and credentials removed successfully"}
