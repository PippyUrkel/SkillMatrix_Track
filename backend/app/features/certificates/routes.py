import uuid
import hashlib
import os
from fastapi import APIRouter, HTTPException, Depends
from web3 import Web3
from ...middleware.auth_middleware import get_current_user
from ...config import get_settings
from .schemas import MintCertificateRequest, MintCertificateResponse

router = APIRouter(prefix="/certificates", tags=["Blockchain Certificates"])
settings = get_settings()

# Minimal ABI for our specific mint function
MINIMAL_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "studentAddress", "type": "address"},
            {"internalType": "string", "name": "metadataURI", "type": "string"}
        ],
        "name": "mintCertificate",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

@router.post("/mint", response_model=MintCertificateResponse)
async def mint_certificate(request: MintCertificateRequest, user_id: str = Depends(get_current_user)):
    """
    Mints a blockchain certificate for a completed course on the Sepolia network.
    """
    try:
        # Prepare Metadata (IPFS pin simulation)
        metadata_url = f"ipfs://bafyrei.../metadata/{request.course_id}.json"
        
        rpc_url = os.environ.get("SEPOLIA_RPC_URL")
        private_key = os.environ.get("PRIVATE_KEY")
        contract_address = os.environ.get("CONTRACT_ADDRESS")
        
        # If env variables are fully configured, execute real web3 transaction
        if rpc_url and private_key and contract_address:
            w3 = Web3(Web3.HTTPProvider(rpc_url))
            account = w3.eth.account.from_key(private_key)
            contract = w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=MINIMAL_ABI)
            
            # Build the transaction
            nonce = w3.eth.get_transaction_count(account.address)
            tx = contract.functions.mintCertificate(
                Web3.to_checksum_address(request.wallet_address), 
                metadata_url
            ).build_transaction({
                'from': account.address,
                'nonce': nonce,
                'gas': 2000000,
                'gasPrice': w3.eth.gas_price
            })
            
            # Sign the transaction
            signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            final_hash = w3.to_hex(tx_hash)
            
            return MintCertificateResponse(
                transaction_hash=final_hash,
                certificate_url=metadata_url,
                message="Successfully minted certificate on Sepolia network"
            )
        else:
            # Fallback for testing when contract is not deployed
            raw_seed = f"{user_id}-{request.course_id}-{request.wallet_address}-{uuid.uuid4()}"
            simulated_hash = "0x" + hashlib.sha256(raw_seed.encode()).hexdigest()
            return MintCertificateResponse(
                transaction_hash=simulated_hash,
                certificate_url=metadata_url,
                message="Simulated minting. Set PRIVATE_KEY, SEPOLIA_RPC_URL, and CONTRACT_ADDRESS to enabled real blockchain transactions."
            )
        
    except Exception as e:
        print(f"Error minting certificate: {e}")
        raise HTTPException(status_code=500, detail="Failed to interact with the blockchain.")
