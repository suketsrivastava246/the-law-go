from fastapi import APIRouter
from ..schemas import AIChatRequest, AIChatResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(request: AIChatRequest):
    query = request.message.lower().strip()
    
    # Intelligent contextual legal knowledge responses with disclaimers
    if "tenant" in query or "rent" in query or "eviction" in query or "landlord" in query:
        response_text = (
            "Under standard tenancy and property laws, landlords must provide formal written notice "
            "(typically 30 to 60 days depending on your jurisdiction and lease terms) before initiating eviction proceedings. "
            "Self-help evictions—such as changing locks, shutting off utilities, or removing tenant belongings without a court order—are illegal in most jurisdictions.\n\n"
            "Key Steps to Protect Your Rights:\n"
            "1. Review your lease contract for specific termination clauses.\n"
            "2. Keep a written record and photographic evidence of rent payments and all communication.\n"
            "3. If served an eviction notice, consult a tenant rights advocate or property attorney immediately."
        )
        resources = ["Tenant Rights & Eviction Protection Guide", "Property Dispute Settlement Procedures"]

    elif "divorce" in query or "custody" in query or "marriage" in query or "maintenance" in query:
        response_text = (
            "Family law matters including dissolution of marriage and child custody are governed by civil and family statutory codes. "
            "Courts prioritize the 'Best Interests of the Child' standard when determining physical and legal custody arrangements, considering factors such as stability, primary caregiver status, and parental fitness.\n\n"
            "Recommendations:\n"
            "1. Compile financial disclosures (bank statements, tax returns, asset titles).\n"
            "2. Explore mediation as a less contentious alternative to court trials.\n"
            "3. Schedule a confidential consultation with a verified family law attorney."
        )
        resources = ["Navigating Child Custody Guidelines", "Marital Property Distribution Framework"]

    elif "contract" in query or "business" in query or "llc" in query or "nda" in query:
        response_text = (
            "A legally enforceable contract requires an offer, valid acceptance, mutual intention to be bound, and consideration (value exchanged). "
            "When drafting or signing commercial agreements:\n\n"
            "1. Ensure clear dispute resolution and arbitration clauses.\n"
            "2. Define confidentiality, non-compete, or intellectual property boundaries clearly.\n"
            "3. Specify jurisdictional governing law to prevent multi-court conflicts."
        )
        resources = ["Contract Drafting Essentials for Startups", "Commercial Dispute Mitigation"]

    elif "bail" in query or "arrest" in query or "police" in query or "criminal" in query:
        response_text = (
            "In criminal matters, you have fundamental constitutional rights:\n"
            "1. Right to remain silent: You are not obligated to answer interrogation questions without legal counsel present.\n"
            "2. Right to legal representation: You can demand an attorney immediately.\n"
            "3. Right to be informed of allegations and brought before a magistrate/court within statutory limits (e.g., 24 hours).\n\n"
            "Urgent: Do not discuss facts of the case before consulting a licensed criminal defense attorney."
        )
        resources = ["Criminal Procedure Code: Bail & Rights", "Your Rights During Police Inquiries"]

    elif "consumer" in query or "refund" in query or "defective" in query:
        response_text = (
            "Consumer protection acts entitle consumers to remedies for defective goods or deficient services, including replacement, refund, or damages for loss caused. "
            "Ensure you preserve proof of purchase, written complaint receipts, and manufacturer warranty cards before filing a grievance before the consumer dispute redressal commission."
        )
        resources = ["Consumer Redressal Filing Handbook"]

    else:
        response_text = (
            f"Regarding your query on '{request.message}':\n\n"
            "The legal framework depends on the applicable local, state, and federal statutes governing this matter. "
            "To evaluate your position accurately, an attorney typically reviews:\n"
            "• Applicable statutory limitations periods (filing deadlines).\n"
            "• Written contracts, communications, notices, or formal documentation.\n"
            "• Potential remedies: negotiation, statutory notice, mediation, or court claims.\n\n"
            "We strongly advise booking a 1-on-1 consultation with a verified legal specialist on THE LAW GO to review your specific facts in confidence."
        )
        resources = ["Understanding Your Fundamental Rights", "How to Prepare for a Legal Consultation"]

    return AIChatResponse(
        response=response_text,
        relevant_resources=resources,
        disclaimer="Disclaimer: THE LAW GO AI Assistant provides preliminary legal information for educational purposes only. It does not constitute legal advice, attorney-client privilege, or formal representation."
    )
