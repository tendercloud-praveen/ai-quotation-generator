from typing import Optional

from fastapi import UploadFile
import fitz
from docx import Document
import tempfile
import os


# ==========================================
# 1. PREPROCESSING
# ==========================================

def preprocess_text(text: str) -> str:

    text = text.strip()

    text = " ".join(text.split())
    # print(text)

    return text


# ==========================================
# 2. INPUT + TEXT EXTRACTION
# ==========================================

async def process_input(
    text: Optional[str] = None,
    file: Optional[UploadFile] = None
):

    # --------------------------------------
    # CASE 1: User entered text
    # --------------------------------------

    if text:

        # print("USER TEXT:")
        # print(text)

        # Pass user text to preprocessing
        result = preprocess_text(text)

        return result



    if file:

       

        content = await file.read()


        if file.content_type == "text/plain":

            extracted_text = content.decode("utf-8")

        elif file.content_type == "application/pdf":

            pdf = fitz.open(
                stream=content,
                filetype="pdf"
            )

            extracted_text = ""

            for page in pdf:
                extracted_text += page.get_text()

            pdf.close()


        # ----------------------------------
        # DOCX
        # ----------------------------------

        elif file.content_type == (
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ):

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".docx"
            ) as temp:

                temp.write(content)
                temp_path = temp.name

            document = Document(temp_path)

            extracted_text = "\n".join(
                paragraph.text
                for paragraph in document.paragraphs
            )

            os.remove(temp_path)


        else:

            raise ValueError(
                f"Unsupported file type: {file.content_type}"
            )

        print("EXTRACTED TEXT:")
        print(extracted_text)

        result = preprocess_text(
            extracted_text
        )

        return result


    return None
       