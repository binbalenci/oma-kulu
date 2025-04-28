from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from datetime import date as date_type

class CategoryBase(BaseModel):
    """Base model for categories"""
    name: str = Field(..., description="Category name")
    type: str = Field(..., description="Category type (income/expense)")
    color: Optional[str] = Field(None, description="Category color for UI")

    model_config = {
        "from_attributes": True
    }

class CategoryCreate(CategoryBase):
    """Model for creating a new category"""
    pass

class Category(CategoryBase):
    """Model for category response"""
    id: int
    created_at: datetime

class TransactionBase(BaseModel):
    """Base model for transactions"""
    amount: float = Field(..., description="Transaction amount")
    type: str = Field(..., description="Transaction type (income/expense)")
    category_id: int = Field(..., description="Transaction category ID")
    date: date_type = Field(default_factory=date_type.today, description="Transaction date")

    model_config = {
        "from_attributes": True
    }

class TransactionCreate(TransactionBase):
    """Model for creating a new transaction"""
    pass

class Transaction(TransactionBase):
    """Model for transaction response"""
    id: str  # uuid
    created_at: datetime
    category: Category  # Use the Category model for the category field 