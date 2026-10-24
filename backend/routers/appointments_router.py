from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Appointment, User, Role
from ..schemas import AppointmentCreate, AppointmentResponse
from ..auth import get_current_user, require_client, require_lawyer

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

@router.post("/", response_model=AppointmentResponse)
def book_appointment(appointment: AppointmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_appointment = Appointment(
        client_id=current_user.id,
        lawyer_id=appointment.lawyer_id,
        specialization=appointment.specialization,
        consultation_type=appointment.consultation_type,
        date=appointment.date,
        time_slot=appointment.time_slot,
        brief_subject=appointment.brief_subject,
        detailed_description=appointment.detailed_description,
        status="confirmed" # confirmed for prototype so user immediately sees active state
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("/me", response_model=List[AppointmentResponse])
def get_my_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == Role.LAWYER:
        return db.query(Appointment).filter(Appointment.lawyer_id == current_user.id).order_by(Appointment.id.desc()).all()
    else:
        return db.query(Appointment).filter(Appointment.client_id == current_user.id).order_by(Appointment.id.desc()).all()

@router.post("/{id}/confirm")
def confirm_appointment(id: int, current_user: User = Depends(require_lawyer), db: Session = Depends(get_db)):
    app = db.query(Appointment).filter(Appointment.id == id, Appointment.lawyer_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    app.status = "confirmed"
    db.commit()
    return {"message": "Appointment confirmed"}

@router.post("/{id}/cancel")
def cancel_appointment(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = db.query(Appointment).filter(
        (Appointment.id == id) & 
        ((Appointment.client_id == current_user.id) | (Appointment.lawyer_id == current_user.id))
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    app.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled successfully"}
