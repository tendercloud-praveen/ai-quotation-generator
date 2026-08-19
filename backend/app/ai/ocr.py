from typing import Optional

from fastapi import UploadFile
import fitz
from docx import Document
from PIL import Image
import pytesseract
import tempfile
import os
import io

from app.ai.embedding import generate_embedding
from app.models.product import Product


# ==========================================
# TESSERACT CONFIGURATION
# ==========================================

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# ==========================================
# 1. PREPROCESSING
# ==========================================

def preprocess_text(text: str) -> str:

    text = text.strip()

    text = " ".join(text.split())

    print(f"Preprocessed text: {text}")

    return text


# ==========================================
# 2. INPUT + TEXT EXTRACTION
# ==========================================

async def process_input(
    text: Optional[str] = None,
    file: Optional[UploadFile] = None,

):

    # --------------------------------------
    # CASE 1: User entered text
    # --------------------------------------

    if text:

        result = preprocess_text(text)

        # Generate embedding
        embedding = generate_embedding(result)

        

        # Return BOTH text and embedding
        return {
            "text": result,
            "embedding": embedding
        }


   

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


   

        elif file.content_type in [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/bmp",
            "image/tiff",
            "image/webp"
        ]:

            print("Processing image with Tesseract OCR...")

            image = Image.open(
                io.BytesIO(content)
            )

            extracted_text = pytesseract.image_to_string(
                image,
                lang="eng",
                config="--oem 3 --psm 6"
            )



        else:

            raise ValueError(
                f"Unsupported file type: {file.content_type}"
            )


       

        result = preprocess_text(
            extracted_text
        )

        print("Preprocessed text:", result)




        embedding = generate_embedding(
            result
        )

        print("Embedding size:", len(embedding))


  

        return {
            "text": result,
            "embedding": embedding
        }




    return None