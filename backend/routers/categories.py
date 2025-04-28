from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Category, CategoryCreate
from config.supabase import supabase

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"]
)

@router.get("/", response_model=List[Category])
async def get_categories():
    """Get all categories"""
    try:
        response = supabase.table("categories").select("*").order("name").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Category)
async def create_category(category: CategoryCreate):
    """Create a new category"""
    try:
        response = supabase.table("categories").insert(category.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{category_id}", response_model=Category)
async def update_category(category_id: int, category: CategoryCreate):
    """Update a category"""
    try:
        response = supabase.table("categories").update(category.model_dump()).eq("id", category_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Category not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{category_id}")
async def delete_category(category_id: int):
    """Delete a category"""
    try:
        response = supabase.table("categories").delete().eq("id", category_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Category not found")
        return {"message": "Category deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 