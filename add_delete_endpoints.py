import os
import sys

BACKEND = r'C:\Users\Dell\Desktop\homemarketplace\backend'
admin_path = os.path.join(BACKEND, 'routers', 'admin.py')
content = open(admin_path, encoding='utf-8').read()

delete_endpoints = """

# -- Delete endpoints --
@router.delete("/sellers/{seller_id}")
def delete_seller(seller_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    seller = db.query(SellerProfile).filter(SellerProfile.id == seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    user_id = seller.user_id
    db.query(Product).filter(Product.seller_id == seller_id).delete(synchronize_session=False)
    db.delete(seller)
    db.flush()
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
    db.commit()
    return {"message": "Seller deleted"}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin accounts")
    if user.role == "seller":
        seller = db.query(SellerProfile).filter(SellerProfile.user_id == user_id).first()
        if seller:
            db.query(Product).filter(Product.seller_id == seller.id).delete(synchronize_session=False)
            db.delete(seller)
            db.flush()
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
"""

content = content.rstrip() + '\n' + delete_endpoints
open(admin_path, 'w', encoding='utf-8').write(content)
print("Done - delete endpoints added to admin.py")

import subprocess
result = subprocess.run(
    ['python', '-c', f'import ast; ast.parse(open(r"{admin_path}", encoding="utf-8").read()); print("Syntax OK")'],
    capture_output=True, text=True
)
print(result.stdout or result.stderr)
