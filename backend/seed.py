import os
from .database import SessionLocal, engine, Base
from .models import User, LawyerProfile, Appointment, LegalResource, Role
from .auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Clearing existing records to re-seed fresh data...")
            db.query(Appointment).delete()
            db.query(LawyerProfile).delete()
            db.query(LegalResource).delete()
            db.query(User).delete()
            db.commit()

        print("Seeding Users...")
        # 1. Admin
        admin_user = User(
            full_name="System Administrator",
            email="admin@thelawgo.com",
            phone="+1 800-555-0100",
            hashed_password=get_password_hash("admin123"),
            role=Role.ADMIN,
            is_active=True
        )
        db.add(admin_user)

        # 2. Clients
        client_john = User(
            full_name="John Doe",
            email="john@example.com",
            phone="+1 555-019-2831",
            hashed_password=get_password_hash("password123"),
            role=Role.CLIENT,
            is_active=True
        )
        client_demo = User(
            full_name="Jane Smith",
            email="client@thelawgo.com",
            phone="+1 555-019-2832",
            hashed_password=get_password_hash("password123"),
            role=Role.CLIENT,
            is_active=True
        )
        db.add_all([client_john, client_demo])
        db.commit()
        db.refresh(client_john)

        print("Seeding Lawyers...")
        lawyers_data = [
            {
                "full_name": "Adv. Sarah Jenkins",
                "email": "sarah.jenkins@thelawgo.com",
                "phone": "+1 212-555-0143",
                "specialization": "Family & Marriage Law",
                "experience_years": 12,
                "bar_number": "NY-984210",
                "qualifications": "J.D. from Harvard Law School, B.A. in Psychology from NYU",
                "location": "New York, NY",
                "fee_per_hour": 150.0,
                "about": "Adv. Sarah Jenkins is an accomplished family attorney specializing in divorce mediation, child custody arrangements, and prenuptial agreements with a compassionate, resolution-first focus.",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
                "rating": 4.9,
                "reviews_count": 124,
                "languages": "English, Spanish"
            },
            {
                "full_name": "Adv. Michael Chen",
                "email": "michael.chen@thelawgo.com",
                "phone": "+1 415-555-0188",
                "specialization": "Corporate & Business Law",
                "experience_years": 15,
                "bar_number": "CA-841920",
                "qualifications": "LL.M. Stanford Law School, B.S. in Economics UC Berkeley",
                "location": "San Francisco, CA",
                "fee_per_hour": 220.0,
                "about": "Adv. Michael Chen counsels startups, VC funds, and high-growth businesses on mergers, venture financings, commercial contracts, and international cross-border compliance.",
                "avatar_url": "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&auto=format&fit=crop",
                "rating": 4.8,
                "reviews_count": 89,
                "languages": "English, Mandarin"
            },
            {
                "full_name": "Adv. Marcus Vance",
                "email": "marcus.vance@thelawgo.com",
                "phone": "+1 312-555-0199",
                "specialization": "Criminal Law",
                "experience_years": 18,
                "bar_number": "IL-552194",
                "qualifications": "J.D. Northwestern Pritzker School of Law, Former Assistant State Prosecutor",
                "location": "Chicago, IL",
                "fee_per_hour": 190.0,
                "about": "With nearly two decades of trial experience, Adv. Marcus Vance provides rigorous criminal defense representation in complex felony charges, white-collar matters, and appellate litigation.",
                "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
                "rating": 4.9,
                "reviews_count": 152,
                "languages": "English"
            },
            {
                "full_name": "Adv. Priya Sharma",
                "email": "priya.sharma@thelawgo.com",
                "phone": "+1 512-555-0177",
                "specialization": "Civil & Property Law",
                "experience_years": 10,
                "bar_number": "TX-719324",
                "qualifications": "J.D. University of Texas at Austin, B.Arch in Urban Planning",
                "location": "Austin, TX",
                "fee_per_hour": 140.0,
                "about": "Specializing in real estate title verifications, commercial lease disputes, zoning laws, and land-partition suits across municipal and federal jurisdictions.",
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
                "rating": 4.7,
                "reviews_count": 68,
                "languages": "English, Hindi"
            },
            {
                "full_name": "Adv. Elena Rostova",
                "email": "elena.rostova@thelawgo.com",
                "phone": "+1 206-555-0133",
                "specialization": "Cyber Crime",
                "experience_years": 8,
                "bar_number": "WA-441029",
                "qualifications": "J.D. University of Washington, Certified Information Privacy Professional (CIPP/US)",
                "location": "Seattle, WA",
                "fee_per_hour": 175.0,
                "about": "Adv. Elena Rostova focuses on cyber forensics, ransomware extortion defense, data protection compliance (GDPR/CCPA), and digital defamation.",
                "avatar_url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop",
                "rating": 5.0,
                "reviews_count": 42,
                "languages": "English, Russian, French"
            },
            {
                "full_name": "Adv. David Miller",
                "email": "david.miller@thelawgo.com",
                "phone": "+1 617-555-0112",
                "specialization": "Taxation & Finance",
                "experience_years": 14,
                "bar_number": "MA-338102",
                "qualifications": "LL.M. in Taxation Boston University, CPA & J.D.",
                "location": "Boston, MA",
                "fee_per_hour": 210.0,
                "about": "Expert in corporate structuring, cross-border tax disputes, IRS audit defenses, estate planning, and wealth succession advisory.",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
                "rating": 4.8,
                "reviews_count": 94,
                "languages": "English"
            }
        ]

        created_lawyer_users = []
        for ldata in lawyers_data:
            l_user = User(
                full_name=ldata["full_name"],
                email=ldata["email"],
                phone=ldata["phone"],
                hashed_password=get_password_hash("password123"),
                role=Role.LAWYER,
                is_active=True
            )
            db.add(l_user)
            db.commit()
            db.refresh(l_user)
            created_lawyer_users.append(l_user)

            l_prof = LawyerProfile(
                user_id=l_user.id,
                specialization=ldata["specialization"],
                experience_years=ldata["experience_years"],
                bar_number=ldata["bar_number"],
                qualifications=ldata["qualifications"],
                location=ldata["location"],
                fee_per_hour=ldata["fee_per_hour"],
                about=ldata["about"],
                avatar_url=ldata["avatar_url"],
                rating=ldata["rating"],
                reviews_count=ldata["reviews_count"],
                languages=ldata["languages"],
                is_verified=True # Verified and ready for consultation
            )
            db.add(l_prof)
            db.commit()

        print("Seeding Sample Appointments...")
        # Add sample appointments for John Doe
        app1 = Appointment(
            client_id=client_john.id,
            lawyer_id=created_lawyer_users[0].id, # Sarah Jenkins
            specialization="Family & Marriage Law",
            consultation_type="Video Call",
            date="2026-11-04",
            time_slot="10:00 AM",
            brief_subject="Child Custody & Parenting Agreement Review",
            detailed_description="Seeking legal advice regarding formalizing holiday parenting schedules and reviewing interstate relocation clauses.",
            status="confirmed"
        )
        app2 = Appointment(
            client_id=client_john.id,
            lawyer_id=created_lawyer_users[1].id, # Michael Chen
            specialization="Corporate & Business Law",
            consultation_type="Video Call",
            date="2026-11-12",
            time_slot="02:30 PM",
            brief_subject="LLC Operating Agreement and Angel Investment Terms",
            detailed_description="Reviewing convertible note provisions and member voting rights for a seed-stage venture.",
            status="pending"
        )
        db.add_all([app1, app2])
        db.commit()

        print("Seeding Legal Resources...")
        resources_data = [
            {
                "title": "Understanding Your Fundamental Rights Under the Constitution",
                "category": "Constitution",
                "summary": "A comprehensive primer on essential procedural guarantees, due process protections, and free speech bounds.",
                "content": """The Constitution serves as the supreme law of the land, establishing the architecture of government and preserving core liberties against arbitrary state action.

### 1. The Guarantee of Due Process
The Due Process clauses ensure that no individual may be deprived of life, liberty, or property without appropriate legal safeguards. Procedural due process demands notice and a meaningful opportunity to be heard before an impartial tribunal.

### 2. Equal Protection Under Law
Government entities are prohibited from denying any person equal protection of the laws. Any legislative classification touching suspect classes (such as race or national origin) faces strict judicial scrutiny.

### 3. Freedom of Speech & Assembly
While expression is protected broadly, the law recognizes valid time, place, and manner restrictions. Clear understanding of these boundaries allows citizens to exercise their democratic rights responsibly.""",
                "author": "Constitutional Law Bureau",
                "read_time": "6 min read",
                "jurisdiction": "Federal / National"
            },
            {
                "title": "Commercial Contracts & Breach of Agreement: A Founder's Guide",
                "category": "Corporate Law",
                "summary": "Learn how contracts are formed, how to draft enforceable limitation of liability clauses, and legal remedies for default.",
                "content": """Contracts form the operational bedrock of commercial enterprise. In modern commercial jurisprudence, clear drafting prevents catastrophic litigation.

### Essential Elements of Formation
• **Offer and Acceptance:** Unambiguous terms communicated and accepted without variation.
• **Consideration:** Quid pro quo—each party must pledge value (goods, services, monetary payment, or forbearance).
• **Capacity & Legality:** Parties must possess legal capacity and the object must be lawful.

### Remedies Upon Material Breach
1. **Expectation Damages:** Placing the injured party in the position they would have occupied had the contract been performed.
2. **Liquidated Damages:** Pre-agreed sums that represent a reasonable forecast of anticipated harm.
3. **Injunctive Relief:** In circumstances of unique intellectual property or non-competes, courts may order specific performance.""",
                "author": "Corporate Advisory Group",
                "read_time": "8 min read",
                "jurisdiction": "Commercial Courts"
            },
            {
                "title": "Criminal Defense 101: Custody, Bail, and Interrogation Rights",
                "category": "Criminal Law",
                "summary": "Crucial legal knowledge on right to silence, statutory timelines for arraignment, and securing bail.",
                "content": """The criminal justice system operates under the fundamental presumption of innocence until proven guilty beyond a reasonable doubt.

### What to Do If Detained
1. **Invoke the Right to Counsel Immediately:** Expressly state: 'I wish to remain silent and I request to speak with my attorney.'
2. **Do Not Consent to Warrantless Searches:** Unless an emergency exception applies, insist on seeing a judicially signed search warrant.
3. **Right to Prompt Arraignment:** In most jurisdictions, an arrested individual must be brought before a judicial officer within 24 to 48 hours for bail determination.""",
                "author": "Adv. Marcus Vance",
                "read_time": "7 min read",
                "jurisdiction": "Criminal Courts"
            },
            {
                "title": "Navigating Child Custody Guidelines & Parenting Plans",
                "category": "Family Law",
                "summary": "Understand how courts evaluate the Best Interests of the Child and how to construct viable joint parenting agreements.",
                "content": """Family transitions involving minor children require structured, objective frameworks. Courts evaluate custody through the guiding doctrine of the child's best interests.

### Legal Custody vs. Physical Custody
• **Legal Custody:** Decision-making authority over major life decisions—education, medical treatment, and religious upbringing.
• **Physical Custody:** Where the child resides on a daily basis.

### Components of a Strong Parenting Plan
A comprehensive parenting plan eliminates ambiguity by detailing:
- Weekday and weekend alternating schedules
- Holiday and school vacation distributions
- Methods of parental communication and mediation protocols before returning to court.""",
                "author": "Family Law Practice Division",
                "read_time": "5 min read",
                "jurisdiction": "Family Court"
            },
            {
                "title": "Cyber Crime, Online Fraud, and Digital Identity Protection",
                "category": "Cyber Crime",
                "summary": "Statutory remedies for online identity theft, unauthorized account access, and cyber extortion.",
                "content": """As financial and personal transactions migrate digitally, malicious cyber intrusion and ransomware pose unprecedented challenges.

### Key Statutory Offenses
• **Computer Fraud and Abuse:** Accessing protected computational systems without authorization or exceeding permitted access.
• **Identity Theft:** Misappropriation of identifying credentials for fraudulent enrichment.
• **Electronic Defamation and Harassment:** Targeted campaigns aimed at malicious intimidation or reputational harm.

### Immediate Defensive Steps
Notify bank and credit bureaus immediately, request a fraud freeze, compile forensic headers and screenshots, and lodge a formal report with cyber crime law enforcement agencies.""",
                "author": "Cyber Law & Forensics Institute",
                "read_time": "6 min read",
                "jurisdiction": "Cyber & Federal"
            },
            {
                "title": "Corporate Taxation & Compliance Checklist for Businesses",
                "category": "Taxation",
                "summary": "Key tax filing dates, deductible expense guidelines, and how to prepare for audit scrutiny.",
                "content": """Maintaining strict compliance with federal and state revenue authorities safeguards businesses from severe civil penalties and criminal audits.

### Best Practices for Corporate Records
1. Maintain separate personal and business bank accounts to maintain the corporate shield.
2. Reconcile payroll tax withholdings and timely remit social security withholdings.
3. Preserve digital substantiation for all deductions exceeding statutory threshold amounts for at least 7 years.""",
                "author": "Tax & Financial Regulation Desk",
                "read_time": "7 min read",
                "jurisdiction": "Internal Revenue / State Tax"
            }
        ]

        for res in resources_data:
            lr = LegalResource(
                title=res["title"],
                category=res["category"],
                summary=res["summary"],
                content=res["content"],
                author=res["author"],
                read_time=res["read_time"],
                jurisdiction=res["jurisdiction"]
            )
            db.add(lr)
        
        db.commit()
        print("Database seeded successfully with all initial users, lawyers, appointments, and resources!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
