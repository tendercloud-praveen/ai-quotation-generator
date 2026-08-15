from sqlalchemy.orm import Session
from app.repositories.quotation_repository import get_total_quotations, get_pending_quotations,get_approved_quotations,get_rejected_quotations, get_dispatched_quotations,get_total_revenue, get_company_products,get_total_team_members, get_total_draft_quotations


def get_total_quotations_count(db: Session, company_id: int):

    total_quotations = get_total_quotations(db, company_id)

    print(f"Company {company_id} Total Quotations: {total_quotations}")

    return total_quotations
def get_pending_quotations_count(db: Session, company_id: int):

    pending_quotations = get_pending_quotations(db, company_id)

    print(f"Company {company_id} Pending Quotations: {pending_quotations}")

    return pending_quotations
def get_approved_quotations_count(db: Session, company_id: int):

    approved_quotations = get_approved_quotations(db, company_id)

    print(f"Company {company_id} Approved Quotations: {approved_quotations}")

    return approved_quotations  
def get_rejected_quotations_count(db: Session, company_id: int):

    rejected_quotations = get_rejected_quotations(db, company_id)

    print(f"Company {company_id} Rejected Quotations: {rejected_quotations}")

    return rejected_quotations
def get_dispatched_quotations_count(db: Session, company_id: int):

    dispatched_quotations = get_dispatched_quotations(db, company_id)

    print(f"Company {company_id} Dispatched Quotations: {dispatched_quotations}")

    return dispatched_quotations
def get_total_revenue_count(db: Session, company_id: int):

    total_revenue = get_total_revenue(db, company_id)

    print(f"Company {company_id} Total Revenue: {total_revenue}")

    return total_revenue
def get_company_products_count(db: Session, company_id: int):

    products = get_company_products(db, company_id)

    product_count = len(products)

    print(f"Company {company_id} Product Count: {product_count}")

    return product_count
def get_total_team_members_count(db: Session, company_id: int):

    total_team_members = get_total_team_members(db, company_id)

    print(f"Company {company_id} Total Team Members: {total_team_members}")

    return total_team_members
def get_total_draft_quotations_count(db: Session, company_id: int):

    total_draft_quotations = get_total_draft_quotations(db, company_id)

    

    return total_draft_quotations