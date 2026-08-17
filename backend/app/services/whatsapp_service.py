import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

# Load .env file
load_dotenv()

WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_API_VERSION = os.getenv("WHATSAPP_API_VERSION", "v21.0")


def send_quotation_pdf(
    customer_mobile: str,
    pdf_path: str,
    quotation_number: str
):
    # ---------------------------------------------------------
    # 1. Validate WhatsApp configuration
    # ---------------------------------------------------------

    if not WHATSAPP_ACCESS_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="WHATSAPP_ACCESS_TOKEN is not configured"
        )

    if not WHATSAPP_PHONE_NUMBER_ID:
        raise HTTPException(
            status_code=500,
            detail="WHATSAPP_PHONE_NUMBER_ID is not configured"
        )

    # ---------------------------------------------------------
    # 2. Validate PDF
    # ---------------------------------------------------------

    file_path = Path(pdf_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Quotation PDF not found: {pdf_path}"
        )

    # ---------------------------------------------------------
    # 3. Clean customer mobile number
    # ---------------------------------------------------------

    mobile = (
        str(customer_mobile)
        .replace("+", "")
        .replace(" ", "")
        .replace("-", "")
        .replace("(", "")
        .replace(")", "")
    )

    if not mobile:
        raise HTTPException(
            status_code=400,
            detail="Customer mobile number is empty"
        )

    # ---------------------------------------------------------
    # 4. WhatsApp headers
    # ---------------------------------------------------------

    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"
    }

    # ---------------------------------------------------------
    # 5. Upload PDF to WhatsApp
    # ---------------------------------------------------------

    media_url = (
        f"https://graph.facebook.com/"
        f"{WHATSAPP_API_VERSION}/"
        f"{WHATSAPP_PHONE_NUMBER_ID}/media"
    )

    with open(file_path, "rb") as pdf_file:

        files = {
            "file": (
                file_path.name,
                pdf_file,
                "application/pdf"
            )
        }

        data = {
            "messaging_product": "whatsapp"
        }

        upload_response = httpx.post(
            media_url,
            headers=headers,
            files=files,
            data=data,
            timeout=60
        )

    if upload_response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "WhatsApp PDF upload failed",
                "status_code": upload_response.status_code,
                "whatsapp_response": upload_response.text
            }
        )

    upload_data = upload_response.json()

    media_id = upload_data.get("id")

    if not media_id:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "WhatsApp did not return media ID",
                "whatsapp_response": upload_data
            }
        )

    # ---------------------------------------------------------
    # 6. Send PDF document to customer
    # ---------------------------------------------------------

    message_url = (
        f"https://graph.facebook.com/"
        f"{WHATSAPP_API_VERSION}/"
        f"{WHATSAPP_PHONE_NUMBER_ID}/messages"
    )

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": mobile,
        "type": "document",
        "document": {
            "id": media_id,
            "caption": f"Quotation {quotation_number}",
            "filename": file_path.name
        }
    }

    message_response = httpx.post(
        message_url,
        headers={
            "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        },
        json=payload,
        timeout=60
    )

    if message_response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "WhatsApp message sending failed",
                "status_code": message_response.status_code,
                "whatsapp_response": message_response.text
            }
        )

    result = message_response.json()

    # ---------------------------------------------------------
    # 7. Success
    # ---------------------------------------------------------

    return {
        "success": True,
        "message": "Quotation sent successfully on WhatsApp",
        "quotation_number": quotation_number,
        "customer_mobile": mobile,
        "media_id": media_id,
        "whatsapp_response": result
    }