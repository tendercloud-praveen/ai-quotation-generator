from sqlalchemy.orm import Session

from app.repositories.dispatch_quotation_repository import (
    dispatch_quotation,
    get_quotation_by_id
)


def dispatch_quotation_service(
    db: Session,
    quotation_id: int,
    company_id: int
):

    quotation = dispatch_quotation(
        db,
        quotation_id,
        company_id
    )

    if not quotation:
        return None

    return quotation


def get_quotation_for_download(
    db: Session,
    quotation_id: int,
    company_id: int
):

    quotation = get_quotation_by_id(
        db,
        quotation_id,
        company_id
    )

    return quotation