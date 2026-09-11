# ⚽ Football Analytics Platform & Smart Data Pipeline

Nền tảng phân tích dữ liệu bóng đá chuyên sâu cho 6 giải đấu hàng đầu châu Âu mùa giải **2026/27**, kết hợp hệ thống **Đường ống dữ liệu tự động (Automated ETL Data Pipeline)** với kiến trúc **100% Zero-Quota** tối ưu chi phí vận hành.

Được xây dựng bằng **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL)**, **Goal API (goal-api.com)** và **Cron Automation**.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🚀 Kiến Trúc Hai Tầng (Dual-Schedule & Zero-Quota Pipeline)
* **Người dùng xem web tiêu tốn 0 API Quota**: Trình duyệt của người dùng chỉ truy vấn trực tiếp từ **Supabase Database**. Dù có hàng nghìn lượt truy cập cùng lúc, số lượt gọi Goal API vẫn là **0**.
* **Hạn ngạch hào phóng từ Goal API**: Gói Free cung cấp **1.000 requests/ngày**, hỗ trợ theo dõi đầy đủ 6 giải đấu và các trận đấu trực tiếp (LIVE).
* **Đồng bộ tự động thông minh (Cron Jobs)**:
  * **Trận LIVE (`/api/cron/live`)**: Tự động chạy **1-2 phút/lần** trong các khung giờ thi đấu để cập nhật tỉ số, thẻ phạt, phạt góc và trận đấu đang diễn ra.
  * **Toàn bộ giải đấu (`/api/cron/full`)**: Tự động chạy định kỳ để đồng bộ lịch thi đấu, kết quả mới nhất và chi tiết sự kiện.
  * **Bắt trận LIVE tức thì**: Pipeline truy vấn trực tiếp endpoint `/fixtures/live` trước tiên để ghi nhận diễn biến trực tiếp (tiêu tốn đúng 1 request Goal API).
* **Auto Polling phía Frontend**: Giao diện người dùng tự động cập nhật dữ liệu mới nhất từ Supabase mỗi 30 giây (khi có trận LIVE) hoặc 10 phút một lần hoàn toàn tự động.

### 2. 🎯 Bộ Lọc Đa Giải Đấu Linh Hoạt & Tức Thì (Instant Multi-League Filter)
* **Chuyển đổi 0ms không độ trễ**: Toàn bộ dữ liệu các giải đấu được nạp sẵn vào React Context (`allMatches`), giúp chuyển đổi giữa các giải đấu ngay lập tức mà không cần gọi lại API.
* **Chế độ xem riêng từng giải**:
  * Khi chọn một giải (ví dụ: **Premier League**, **Champions League**, **La Liga**, **Serie A**, **Bundesliga**, **Ligue 1**...):
    * 12 thẻ KPI tính toán chính xác 100% **chỉ riêng cho giải đấu đó**.
    * Tiêu đề, phụ đề và huy hiệu hiển thị đầy đủ tên giải, cờ hiệu và tỷ lệ hoàn thành vòng đấu.
    * Biểu đồ so sánh giữa các giải tự động **tô sáng màu Xanh Emerald** cột của giải đang chọn để dễ dàng so sánh với 5 giải còn lại.
* **Chế độ xem toàn bộ ("Tất cả 6 giải")**:
  * Tổng hợp và tính toán toàn bộ các trận đấu của cả 6 giải có trong database.
* **Huy hiệu số trận trực quan trên Sidebar**: Hiển thị số lượng trận thực tế có trong database ngay cạnh tên giải (ví dụ: EPL: 8 trận, UCL: 18 trận, Tổng: 48 trận).

### 3. 📐 Engine Phân Tích Thống Kê Chuẩn Xác (Analytics Engine)
* **Loại trừ trận chưa đá**: Chỉ tính toán các chỉ số trung bình (Bàn thắng, Phạt góc, Thẻ phạt, Tài Xỉu, BTTS, Tỷ lệ Thắng/Hòa) dựa trên các trận đã kết thúc (`FINISHED`) hoặc đang diễn ra (`LIVE`), ngăn ngừa sai lệch tỷ số và lỗi hòa 0-0 ảo.
* **Phong độ 5 trận gần nhất thực tế**: Chỉ hiển thị chuỗi kết quả (W/D/L) thực tế các trận đã diễn ra, không tự bù kết quả giả.
* **Đầy đủ 12 chỉ số KPI quan trọng**:
  1. Tổng số trận đã đấu / tổng số trận trong lịch.
  2. Tổng số bàn thắng hợp lệ.
  3. Bàn thắng trung bình mỗi trận.
  4. Phạt góc trung bình mỗi trận.
  5. Thẻ vàng trung bình mỗi trận.
  6. Thẻ đỏ trung bình mỗi trận.
  7. Tỷ lệ cả 2 đội ghi bàn (BTTS %).
  8. Tỷ lệ giữ sạch lưới (Clean Sheet %).
  9. Tỷ lệ nổ tài bàn thắng (> 2.5 bàn %).
  10. Tỷ lệ đội chủ nhà thắng (Home Win %).
  11. Tỷ lệ hai đội hòa (Draw %).
  12. Tỷ lệ đội khách thắng (Away Win %).

---

## 🖥️ Các Phân Hệ Giao Diện & Ứng Dụng

| Trang | Chức Năng Chính |
| :--- | :--- |
| **Tổng Quan (Overview)** | 12 thẻ KPI tổng quan, biểu đồ so sánh 6 giải đấu (bàn thắng, góc, BTTS), banner thông tin trận LIVE thời gian thực. |
| **BXH & Giải Đấu (Competition)** | Bảng xếp hạng chi tiết (vị trí, trận đã đá, hiệu số, điểm số, form 5 trận) của 6 giải đấu lớn, tự động đồng bộ theo bộ lọc giải ở Sidebar. |
| **Phân Tích Đội Bóng (Team Analytics)** | Thống kê chuyên sâu từng CLB: tỷ lệ thắng sân nhà/sân khách, số trận sạch lưới, hiệu suất bàn thắng theo giải đấu được chọn. |
| **Match Center & Live** | Chi tiết từng trận: tỉ số, kiểm soát bóng, số cú dứt điểm, sút trúng đích, phạt góc, thẻ phạt, timeline bàn thắng/thay người, đội hình thi đấu. |
| **Odds & Kèo Châu Á (Betting Analytics)** | Máy tính quyết toán Kèo Châu Á (Asian Handicap) và Kèo Tài Xỉu (Over/Under) chuẩn quốc tế (Win, Half Win, Push, Half Loss, Loss). |
| **ETL & Quota Monitor** | Bảng giám sát hạn mức Goal API hàng ngày (1.000 req/ngày), nút kích hoạt nạp dữ liệu thủ công vào Supabase tức thì. |

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Giao diện (Frontend)**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Recharts.
* **Backend & API**: Next.js API Routes (`/api/football`, `/api/admin/sync`, `/api/cron/live`, `/api/cron/full`, `/api/football/quota`).
* **Cơ sở dữ liệu (Database)**: Supabase (PostgreSQL) với bảng `matches` được thiết lập khóa chính và cơ chế `upsert` idempotent.
* **Tự động hóa (Automation)**: cron-job.org bảo mật qua `SPORT_ANALYTICS_KEY` / `CRON_SECRET`.
* **Khai thác dữ liệu (Data Source)**: Goal API ([goal-api.com](https://goal-api.com/)).

---

## 📐 Kiến Trúc Luồng Dữ Liệu (Architecture Diagram)

```text
                          +-------------------------------+
                          |     Goal API (goal-api.com)   |
                          +-------------------------------+
                                           |
                            (cron-job.org: 1-2m LIVE / Daily Full)
                                           |
                                           v
                          +-------------------------------+
                          |    Next.js API Cron Routes    |
                          | (/api/cron/live, /cron/full)  |
                          +-------------------------------+
                                           |
                                    (Clean & Upsert)
                                           |
                                           v
                          +-------------------------------+
                          | Supabase PostgreSQL Database  |
                          |        (Bảng `matches`)       |
                          +-------------------------------+
                                           |
                               (100% Read Query - 0 Quota)
                                           |
                                           v
                          +-------------------------------+
                          |    Next.js Web Application    |
                          |  (Context Cache: allMatches)  |
                          |  (Filter theo giải tức thì)   |
                          +-------------------------------+
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### 1. Yêu cầu môi trường
* **Node.js**: Phiên bản 20.x trở lên.
* **npm** hoặc **yarn** / **pnpm**.
* Tài khoản [Supabase](https://supabase.com/) và tài khoản [Goal API](https://goal-api.com/signup).

### 2. Cấu hình biến môi trường (`.env.local`)
Sao chép file mẫu `.env.example` sang `.env.local`:

```bash
cp .env.example .env.local
```

Cập nhật các giá trị cấu hình vào file `.env.local`:

```env
# Goal API Configuration
GOAL_API_KEY=your_goal_api_key_here
NEXT_PUBLIC_GOAL_API_KEY=your_goal_api_key_here

# Supabase Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Cron Job Security Secret (cron-job.org)
SPORT_ANALYTICS_KEY=your_cron_secret_here
```

> ⚠️ **Lưu ý bảo mật**: Tuyệt đối không commit file `.env.local` hoặc để lộ `SUPABASE_SERVICE_ROLE_KEY` lên kho lưu trữ công khai (GitHub).

### 3. Cài đặt thư viện & Khởi chạy

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Đồng bộ dữ liệu mẫu từ Goal API vào Supabase (tùy chọn)
node scripts/sync-to-supabase.js

# 3. Khởi chạy server phát triển
npm run dev

# 4. Kiểm tra biên dịch sản phẩm (Production Build)
npm run build
```

Mở trình duyệt và truy cập: `http://localhost:3000`

---

## 📄 Cấu Trúc Bảng Database (`matches`)

Bảng `matches` trong cơ sở dữ liệu Supabase được thiết kế tối ưu với cấu trúc:

```sql
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL,
  season TEXT NOT NULL,
  round TEXT,
  status TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  referee TEXT,
  elapsed_time INT DEFAULT 0,
  home_team_id TEXT,
  home_team_name TEXT NOT NULL,
  home_team_logo TEXT,
  away_team_id TEXT,
  away_team_name TEXT NOT NULL,
  away_team_logo TEXT,
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  stats JSONB DEFAULT '{}'::jsonb,
  events JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ mục tối ưu truy vấn theo giải đấu và thời gian
CREATE INDEX IF NOT EXISTS idx_matches_league_date ON matches(league_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
```

### Ý nghĩa các trường chính:
* `id` (text, Primary Key): ID định danh trận đấu từ API.
* `league_id` (text): Mã giải đấu (`PL`, `LL`, `SA`, `BL`, `L1`, `UCL`).
* `season` (text): Mùa giải (`2026/2027`).
* `status` (text): Trạng thái (`UPCOMING`, `LIVE`, `FINISHED`).
* `date` (timestamptz): Thời điểm diễn ra trận đấu theo chuẩn UTC.
* `home_team_name`, `away_team_name`: Tên câu lạc bộ chủ nhà và khách.
* `home_team_logo`, `away_team_logo`: Logo câu lạc bộ.
* `home_score`, `away_score`: Tỷ số thời gian thực.
* `stats` (jsonb): Thống kê trận đấu (possession, shots, corners, fouls, cards...).
* `events` (jsonb): Mốc sự kiện diễn ra (bàn thắng, thẻ phạt, thay người).

---

## 📜 Giấy Phép & Tác Quyền

Dự án được xây dựng và phát triển cho mục đích học tập, nghiên cứu và phân tích dữ liệu thể thao.
