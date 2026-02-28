from pydantic import BaseModel

class MintCertificateRequest(BaseModel):
    course_id: str
    wallet_address: str # The user's Polygon wallet address

class MintCertificateResponse(BaseModel):
    transaction_hash: str
    certificate_url: str
    message: str
