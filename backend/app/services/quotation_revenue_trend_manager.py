from datetime import datetime

from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

from app.repositories.quotation_revenue_trend_manager import (
    QuotationRevenueTrendManagerRepository
)


class QuotationRevenueTrendManagerService:

    @staticmethod
    def get_manager_quotation_revenue_trend(
        db: Session,
        manager_id: int,
        company_id: int
    ):

        # Current date
        today = datetime.utcnow()

        # First day of current month
        current_month = today.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )

        # Last 7 months including current month
        start_month = (
            current_month -
            relativedelta(months=6)
        )

        # Get data from repository
        results = (
            QuotationRevenueTrendManagerRepository
            .get_manager_quotation_revenue(
                db=db,
                manager_id=manager_id,
                company_id=company_id,
                start_date=start_month
            )
        )

        # Convert database results into dictionary
        result_dict = {}

        for row in results:

            month_key = row.month.strftime("%Y-%m")

            result_dict[month_key] = {
                "month": row.month.strftime("%b"),
                "quotation_count": int(
                    row.quotation_count or 0
                ),
                "revenue": float(
                    row.revenue or 0
                )
            }

        # Always return all 7 months
        months = []

        for i in range(7):

            month_date = (
                start_month +
                relativedelta(months=i)
            )

            month_key = month_date.strftime("%Y-%m")

            if month_key in result_dict:

                months.append(
                    result_dict[month_key]
                )

            else:

                months.append({
                    "month": month_date.strftime("%b"),
                    "quotation_count": 0,
                    "revenue": 0
                })

        return {
            "success": True,
            "manager_id": manager_id,
            "period": "Last 7 months",
            "months": months
        }