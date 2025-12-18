# Admin API Guide - Vendor & Plan Approval

Tài liệu hướng dẫn sử dụng API duyệt vendor và plan cho Admin.

## Mục lục
- [Tổng quan](#tổng-quan)
- [Authentication](#authentication)
- [API Duyệt Vendor](#api-duyệt-vendor)
- [API Duyệt Plan](#api-duyệt-plan)
- [Flow duyệt](#flow-duyệt)

---

## Tổng quan

Admin có các quyền sau:
- Xem danh sách tất cả vendors (bao gồm pending, approved, rejected)
- Xem chi tiết từng vendor
- Duyệt hoặc từ chối vendor
- Xem danh sách tất cả plans (bao gồm pending, approved, rejected)
- Xem chi tiết từng plan
- Duyệt hoặc từ chối plan

## Authentication

Tất cả các API admin yêu cầu:
1. JWT token hợp lệ trong header
2. User phải có role = `admin`

```bash
Authorization: Bearer {admin_access_token}
```

Nếu user không phải admin, API sẽ trả về lỗi 403:
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền truy cập vào tài nguyên này ( Vai trò không hợp lệ)"
}
```

---

## API Duyệt Vendor

### 1. Lấy danh sách vendors

**Endpoint:** `GET /vendor/admin/all`

**Query Parameters:**
- `status` (optional): Lọc theo trạng thái
  - `pending`: Chờ duyệt
  - `approved`: Đã duyệt
  - `rejected`: Đã từ chối
- `limit` (optional, default: 20): Số lượng items trên 1 trang
- `offset` (optional, default: 0): Vị trí bắt đầu

**Example Request:**
```bash
# Lấy tất cả vendors chờ duyệt
GET /vendor/admin/all?status=pending

# Lấy tất cả vendors (phân trang)
GET /vendor/admin/all?limit=10&offset=0
```

**Example Response:**
```json
{
  "vendors": [
    {
      "id": 1,
      "user_id": 5,
      "name": "Tech Store",
      "email": "tech@vendor.com",
      "phone": "0901234567",
      "status": "pending",
      "createdAt": "2025-12-18T10:00:00.000Z",
      "plans": [
        {
          "id": 10,
          "name": "Premium Software",
          "status": "pending"
        }
      ]
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Xem chi tiết vendor

**Endpoint:** `GET /vendor/admin/:id`

**Example Request:**
```bash
GET /vendor/admin/1
```

**Example Response:**
```json
{
  "id": 1,
  "name": "Tech Store",
  "email": "tech@vendor.com",
  "phone": "0901234567",
  "status": "pending",
  "totalSubscribers": 0,
  "totalRevenue": 0,
  "totalPlans": 2,
  "plans": [...]
}
```

---

### 3. Duyệt/Từ chối vendor

**Endpoint:** `PATCH /vendor/admin/:id/approve`

**Request Body:**
```json
{
  "status": "approved",  // hoặc "rejected" hoặc "pending"
  "reason": "Vendor đáp ứng đầy đủ yêu cầu"  // optional
}
```

**Các status:**
- `approved`: Duyệt vendor, cho phép bán hàng
- `rejected`: Từ chối vendor
- `pending`: Reset về trạng thái chờ duyệt

**Example - Duyệt vendor:**
```bash
PATCH /vendor/admin/1/approve
Content-Type: application/json

{
  "status": "approved",
  "reason": "Vendor có uy tín, đầy đủ giấy tờ"
}
```

**Example - Từ chối vendor:**
```bash
PATCH /vendor/admin/1/approve
Content-Type: application/json

{
  "status": "rejected",
  "reason": "Thiếu giấy tờ chứng minh doanh nghiệp"
}
```

**Response:**
```json
{
  "message": "Vendor approved successfully",
  "vendor": {
    "id": 1,
    "name": "Tech Store",
    "email": "tech@vendor.com",
    "status": "approved",
    "reason": "Vendor có uy tín, đầy đủ giấy tờ"
  }
}
```

---

## API Duyệt Plan

### 1. Lấy danh sách plans

**Endpoint:** `GET /packages/admin/all`

**Query Parameters:**
- `status` (optional): Lọc theo trạng thái
  - `pending`: Chờ duyệt
  - `approved`: Đã duyệt
  - `rejected`: Đã từ chối
- `limit` (optional, default: 20)
- `offset` (optional, default: 0)

**Example Request:**
```bash
# Lấy tất cả plans chờ duyệt
GET /packages/admin/all?status=pending

# Lấy tất cả plans đã duyệt
GET /packages/admin/all?status=approved
```

**Example Response:**
```json
{
  "plans": [
    {
      "id": 10,
      "name": "Premium Software",
      "price": 299000,
      "status": "pending",
      "vendor": {
        "id": 1,
        "name": "Tech Store",
        "status": "approved"
      },
      "category": {
        "id": 3,
        "name": "Software"
      }
    }
  ],
  "total": 25,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Xem chi tiết plan

**Endpoint:** `GET /packages/admin/:id`

**Example Request:**
```bash
GET /packages/admin/10
```

**Example Response:**
```json
{
  "id": 10,
  "name": "Premium Software",
  "description": "Full access to all features",
  "price": 299000,
  "duration_unit": "tháng",
  "duration_value": 1,
  "status": "pending",
  "vendor": {
    "id": 1,
    "name": "Tech Store",
    "status": "approved"
  },
  "category": {
    "id": 3,
    "name": "Software"
  },
  "subscriptions": []
}
```

---

### 3. Duyệt/Từ chối plan

**Endpoint:** `PATCH /packages/admin/:id/approve`

**Request Body:**
```json
{
  "status": "approved",  // hoặc "rejected" hoặc "pending"
  "reason": "Plan đáp ứng tiêu chuẩn chất lượng"  // optional
}
```

**Các status:**
- `approved`: Duyệt plan, hiển thị cho khách hàng
- `rejected`: Từ chối plan (tự động set `is_active = false`)
- `pending`: Reset về trạng thái chờ duyệt

**Example - Duyệt plan:**
```bash
PATCH /packages/admin/10/approve
Content-Type: application/json

{
  "status": "approved",
  "reason": "Gói dịch vụ có nội dung rõ ràng, giá hợp lý"
}
```

**Example - Từ chối plan:**
```bash
PATCH /packages/admin/10/approve
Content-Type: application/json

{
  "status": "rejected",
  "reason": "Giá quá cao so với thị trường, nội dung chưa rõ ràng"
}
```

**Response:**
```json
{
  "message": "Plan approved successfully",
  "plan": {
    "id": 10,
    "name": "Premium Software",
    "vendor": "Tech Store",
    "status": "approved",
    "reason": "Gói dịch vụ có nội dung rõ ràng, giá hợp lý"
  }
}
```

---

## Flow duyệt

### Flow duyệt Vendor

```
1. Vendor đăng ký → status = "pending"
2. Admin xem danh sách vendors pending
3. Admin xem chi tiết vendor
4. Admin duyệt/từ chối:
   - Approve → status = "approved" → Vendor có thể tạo plans
   - Reject → status = "rejected" → Vendor không thể bán hàng
```

### Flow duyệt Plan

```
1. Vendor tạo plan mới → status = "pending"
2. Admin xem danh sách plans pending
3. Admin xem chi tiết plan
4. Admin duyệt/từ chối:
   - Approve → status = "approved" → Plan hiển thị cho khách hàng
   - Reject → status = "rejected" + is_active = false → Plan bị ẩn
```

### Lưu ý quan trọng

1. **Vendor phải được approve trước khi plan của họ có thể được approve**
   - Nếu vendor bị rejected, nên reject tất cả plans của vendor đó

2. **Plan chỉ hiển thị cho khách hàng khi:**
   - Plan status = "approved"
   - Plan is_active = true
   - Vendor status = "approved"

3. **Khi reject plan:**
   - Hệ thống tự động set `is_active = false`
   - Plan sẽ không hiển thị trong danh sách công khai

4. **Thông báo:**
   - Nên gửi notification cho vendor khi approve/reject
   - Bao gồm lý do (`reason`) khi reject để vendor biết cách cải thiện

---

## Testing với Postman

### 1. Đăng nhập với tài khoản admin

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Lưu `access_token` từ response.

### 2. Set Authorization header

Trong Postman:
- Tab "Authorization"
- Type: "Bearer Token"
- Token: paste `access_token` vừa lấy được

### 3. Test các endpoints

```bash
# 1. Lấy danh sách vendors pending
GET /vendor/admin/all?status=pending

# 2. Xem chi tiết vendor
GET /vendor/admin/1

# 3. Duyệt vendor
PATCH /vendor/admin/1/approve
{
  "status": "approved",
  "reason": "OK"
}

# 4. Lấy danh sách plans pending
GET /packages/admin/all?status=pending

# 5. Xem chi tiết plan
GET /packages/admin/10

# 6. Duyệt plan
PATCH /packages/admin/10/approve
{
  "status": "approved",
  "reason": "OK"
}
```

---

## Error Handling

### Common Errors

**403 Forbidden - Không phải admin:**
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền truy cập vào tài nguyên này ( Vai trò không hợp lệ)"
}
```

**404 Not Found - Vendor/Plan không tồn tại:**
```json
{
  "statusCode": 404,
  "message": "Vendor with ID 1 not found"
}
```

**401 Unauthorized - Token không hợp lệ:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**400 Bad Request - Dữ liệu không hợp lệ:**
```json
{
  "statusCode": 400,
  "message": ["status must be one of the following values: pending, approved, rejected"]
}
```

---

**Cập nhật:** December 18, 2025  
**Version:** 1.0.0
