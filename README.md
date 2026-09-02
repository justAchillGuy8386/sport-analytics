# ⚽ Sport Analytics Platform & Automated ETL Data Pipeline

Một nền tảng phân tích dữ liệu bóng đá chuyên sâu và hệ thống **Tự động hóa Đường ống dữ liệu (Automated Data Pipeline)** được xây dựng bằng **Next.js 16**, **Supabase (PostgreSQL)**, **TypeScript**, và **GitHub Actions**.

Hệ thống kết nối trực tiếp với **API-Football (v3)**, xử lý dữ liệu (ETL), lưu trữ vào **Supabase Database**, và hiển thị giao diện phân tích phong độ, thống kê chỉ số, kèo Châu Á (Asian Handicap), Tài Xỉu (Over/Under) theo thời gian thực.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🚀 Kiến Trúc 100% Zero-Quota Người Dùng
* **Đọc 100% từ Database**: Trình duyệt của người dùng khi truy cập, chuyển trang hay F5 reload **chỉ truy vấn trực tiếp từ Supabase Database**.
* **Tiết kiệm 100% Quota**: Việc xem web hoàn toàn không tiêu tốn bất kỳ lượt request API-Football nào của bạn. Dù có hàng ngàn người truy cập cùng lúc, quota API vẫn là 0!

### 2. 🤖 Tự Động Hóa Data Pipeline (GitHub Actions CI/CD)
* **Khung giờ Cao Điểm Đêm (18:00 – 06:00 giờ Việt Nam)**: Tự động chạy **10 phút/lần** để cập nhật tỉ số, phút thi đấu LIVE của các giải Châu Âu.
* **Khung giờ Ban Ngày (06:00 – 18:00 giờ Việt Nam)**: Tự động chạy **2 tiếng/lần** để cập nhật danh sách các trận đấu sắp diễn ra.
* **Xử lý Thời gian Động (Dynamic Date Engine)**: Tự động tính toán khoảng thời gian thực (từ 3 ngày trước đến 3 ngày sau) và mùa giải hiện tại mà không cần hardcode số năm hay ID cứng.

### 3. 📊 Các Phân Hệ Quản Trị & Phân Tích Dữ Liệu
* **Tổng Quan (Overview Tab)**:
  * KPI động: Tổng số trận, Tổng bàn thắng, Bàn thắng trung bình/trận, Số giải đấu active.
  * Danh sách trận LIVE & Trận đấu mới nhất.
  * Tích hợp công cụ tính toán kèo Châu Á (Asian Handicap), Kèo Tài Xỉu (Over/Under), Kèo Phạt Góc.
  * Modal chi tiết trận đấu: Thống kê kiểm soát bóng, số cú sút, thẻ phạt, diễn biến mốc thời gian (timeline events).
* **Trung Tâm Trận Đấu (Match Center Tab)**:
  * So sánh đối đầu (H2H), phong độ 5 trận gần nhất.
  * Phân tích sức mạnh Tấn công vs Phòng ngự giữa 2 đội.
* **Bảng Xếp Hạng Giải Đấu (Competition Tab)**:
  * Bảng xếp hạng trực tiếp của 6 giải đấu hàng đầu: Premier League (Anh), La Liga (Tây Ban Nha), Serie A (Ý), Bundesliga (Đức), Ligue 1 (Pháp), và UEFA Champions League (C1).
  * Chuỗi phong độ (Form W/D/L), Hiệu số bàn thắng thua, điểm số thực tế.
* **Giám Sát ETL & API Quota (ETL & Quota Monitor Tab)**:
  * Theo dõi số lượng request API-Football thực tế còn lại trong ngày (`/status`).
  * Nút bấm Admin: **`⚡ Nạp Trận Đấu Mới Vào Supabase DB`** cho phép kích hoạt nạp dữ liệu thủ công tức thì trong 2 giây.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, Lucide React, Recharts.
* **Backend & API**: Next.js API Routes (`/api/football`, `/api/admin/sync`).
* **Database**: Supabase (PostgreSQL Database) với bảng `matches` được tối ưu hóa chỉ mục (indexes) & quy tắc `upsert`.
* **Automation / Orchestration**: GitHub Actions Scheduled Workflows (`.github/workflows/sync-supabase.yml`).
* **ETL Engine**: Node.js Script ([`scripts/sync-to-supabase.js`](file:///d:/GitHub/sport-analytics/scripts/sync-to-supabase.js)) tích hợp SDK `@supabase/supabase-js`.
* **Data Provider**: API-Football v3 ([api-sports.io](https://api-sports.io/)).

---

## 📐 Kiến Trúc Luồng Dữ Liệu (Data Architecture)

```text
               +----------------------------------+
               |        API-Football (v3)         |
               +----------------------------------+
                                |
             (10 phút/lần ban đêm | 2 tiếng/lần ban ngày)
                                |
                                v
               +----------------------------------+
               |      GitHub Actions Cloud        |
               | (scripts/sync-to-supabase.js)    |
               +----------------------------------+
                                |
                         (Clean & Upsert)
                                |
                                v
               +----------------------------------+
               |   Supabase Database (PostgreSQL) |
               |          Bảng `matches`          |
               +----------------------------------+
                                |
                       (100% Read Query)
                                |
                                v
               +----------------------------------+
               |    Next.js Web Application       |
               | (Overview / Standings / Betting) |
               +----------------------------------+
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Development)

### 1. Yêu cầu hệ thống
* Node.js version 20 trở lên
* Tài khoản Supabase Database
* API Key từ API-Football (v3)

### 2. Cấu hình biến môi trường (`.env.local`)
Tạo file `.env.local` tại thư mục gốc của dự án với nội dung:

```env
API_FOOTBALL_KEY=3f779659d2f2fdc3ecf432a3c49b2aae
NEXT_PUBLIC_API_FOOTBALL_KEY=3f779659d2f2fdc3ecf432a3c49b2aae
NEXT_PUBLIC_SUPABASE_URL=https://gahvaakmpvvnmryqzbpg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Cài đặt phụ thuộc & Chạy dự án

```bash
# Cài đặt các thư viện
npm install

# Chạy server phát triển cục bộ
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

---

## ⚙️ Cấu Hướng Tự Động Hóa GitHub Actions (CI/CD)

Để thiết lập máy chủ Cloud tự động chạy ngầm theo lịch, bạn cấu hình các **GitHub Secrets** tại:
`GitHub Repository -> Settings -> Secrets and variables -> Actions`

* **`API_FOOTBALL_KEY`**: Mã API Key của API-Football.
* **`NEXT_PUBLIC_SUPABASE_URL`**: Đường dẫn URL dự án Supabase.
* **`SUPABASE_SERVICE_ROLE_KEY`**: Mã Service Role Key của Supabase để có quyền ghi dữ liệu.

Workflow file nằm tại: [`.github/workflows/sync-supabase.yml`](file:///d:/GitHub/sport-analytics/.github/workflows/sync-supabase.yml)

---

## 📝 Giấy Phép & Đóng Góp (License)

Dự án được phát triển phục vụ mục đích phân tích dữ liệu bóng đá và trình diễn kỹ năng Data Engineering & Web Analytics.
