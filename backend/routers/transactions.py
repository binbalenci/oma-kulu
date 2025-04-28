from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Transaction, TransactionCreate
from config.supabase import supabase
from datetime import date

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"]
)

def transform_transaction(transaction):
    """Transform transaction data to match our model's expectations"""
    if "categories" in transaction:
        transaction["category"] = transaction.pop("categories")
    # Convert date string to date object for incoming data
    if "date" in transaction and isinstance(transaction["date"], str):
        transaction["date"] = date.fromisoformat(transaction["date"])
    return transaction

@router.get("/", response_model=List[Transaction])
async def get_transactions():
    """Get all transactions"""
    try:
        response = supabase.table("transactions") \
            .select("*, categories(*)") \
            .order("date", desc=True) \
            .execute()
        transformed_data = [transform_transaction(t) for t in response.data]
        return transformed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate):
    """Create a new transaction"""
    try:
        # Convert date to string for Supabase
        transaction_data = transaction.model_dump()
        transaction_data["date"] = transaction_data["date"].isoformat()
        
        response = supabase.table("transactions").insert(transaction_data).execute()
        # Fetch the created transaction with category information
        created_transaction = supabase.table("transactions") \
            .select("*, categories(*)") \
            .eq("id", response.data[0]["id"]) \
            .single() \
            .execute()
        return transform_transaction(created_transaction.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(transaction_id: str, transaction: TransactionCreate):
    """Update a transaction"""
    try:
        # Convert date to string for Supabase
        transaction_data = transaction.model_dump()
        transaction_data["date"] = transaction_data["date"].isoformat()
        
        response = supabase.table("transactions").update(transaction_data).eq("id", transaction_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Transaction not found")
        # Fetch the updated transaction with category information
        updated_transaction = supabase.table("transactions") \
            .select("*, categories(*)") \
            .eq("id", transaction_id) \
            .single() \
            .execute()
        return transform_transaction(updated_transaction.data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str):
    """Delete a transaction"""
    try:
        response = supabase.table("transactions").delete().eq("id", transaction_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return {"message": "Transaction deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 