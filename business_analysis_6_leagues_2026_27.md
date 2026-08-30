# **WORLD FOOTBALL ANALYTICS PLATFORM** 

Business Analysis & Technical Specification — 6 giải đấu mùa 2026/27 

Phạm vi mới: thay cho World Cup 2026, hệ thống tập trung vào 5 giải VĐQG hàng đầu châu Âu và UEFA Champions League trong mùa giải 2026/27. 

|**Mã**|**Giải đấu**|**Competition**|
|---|---|---|
|PL|Premier League|England|
|LL|La Liga|Spain|
|SA|Serie A|Italy|
|BL|Bundesliga|Germany|
|L1|Ligue 1|France|
|UCL|UEFA Champions League|Europe|



## **1. Mục tiêu dự án** 

Xây dựng một mini data platform tự động thu thập dữ liệu bóng đá từ API-Football, lưu trữ dữ liệu lịch sử và dữ liệu cập nhật, chuẩn hóa thành mô hình quan hệ, tạo lớp analytics bằng SQL/Python và cung cấp dashboard theo giải đấu, đội bóng và trận đấu. 

Mục tiêu portfolio là thể hiện năng lực Data Analyst/Data Engineering ở mức project cá nhân: API ingestion → ETL → database → data quality → analytics → dashboard → automation. 

## **2. Phạm vi dữ liệu** 

|**Nhóm**|**Dữ liệu cần thu thập**|
|---|---|
|Fixture|fixture ID, ngày/giờ, mùa, vòng đấu, sân, trọng tài, trạng thái|
|Score|HT, FT, hiệp phụ, penalty nếu có|
|Events|goal, own goal, penalty, yellow/red card, substitution, VAR nếu API cung cấp|
|Team stats|possession, shots, shots on/off target, corners, fouls, offsides, saves...|
|Lineups|đội hình, starter, substitute, formation, player positions nếu coverage có|
|Player stats|minutes, shots, goals, assists, cards, passes... tùy coverage|
|Standings|rank, points, W/D/L, goals for/against, goal difference|
|Odds|pre-match/live odds, bookmaker, market, selection, handicap, price, timestamp|



## **3. Kiến trúc hệ thống** 

Kiến trúc ưu tiên serverless/scheduled jobs: không cần máy cá nhân hoặc VPS chạy 24/7. GitHub Actions chỉ cấp runner khi đến lịch, chạy ETL, ghi PostgreSQL rồi kết thúc. 

World Football Analytics Platform — Business Analysis 

Trang 1 

`API-Football` ↓ `GitHub Actions Scheduler` ↓ `Python ETL / Smart Polling` ↓ `Raw / Normalized PostgreSQL` ↓ `SQL Views + Analytics Layer` ↓ `Power BI / Web Dashboard` 

## **4. API quota và chiến lược sử dụng Free plan** 

Theo trang pricing hiện tại của API-Football, Free plan có 100 requests/ngày và truy cập các endpoint chính như fixtures, events, lineups, statistics, pre-match odds và in-play odds. API-Football cũng công bố giới hạn 10 requests/phút cho Free plan. Vì vậy 15 phút/lần cả ngày sẽ tiêu 96 requests/ngày và để lại rất ít margin. 

Không thiết kế hệ thống theo kiểu: cứ 15 phút gọi toàn bộ 6 giải. Thay vào đó dùng Smart Polling: chỉ ưu tiên fixture LIVE và fixture vừa FINISHED; fixture UPCOMING được lấy thưa hơn; fixture đã hoàn tất không tiếp tục poll liên tục. 

|**Chiến lược**|**Request/ngày tối đa theo**|**lịchĐánh giá**|
|---|---|---|
|15 phút cả 24h|96|Không nên: sát quota 100|
|30 phút cả 24h|48|Có thể, nhưng lãng phí|
|Smart polling|Tùy số trận live|Khuyến nghị|
|Event-driven khi có hạ tầ|ng phù hợpTối ưu|Giai đoạn nâng cao|



## **5. Smart Polling — nghiệp vụ cập nhật dữ liệu** 

UPCOMING: lấy lịch/metadata theo batch; không cần poll 15 phút. LIVE: ưu tiên cao nhất; cập nhật theo chu kỳ 15–30 phút tùy quota. FINISHED: lấy final data, chạy reconciliation, sau đó ngừng poll. CANCELLED/POSTPONED: cập nhật status và lịch mới nếu API cung cấp. 

Nếu API cho phép truy vấn nhiều fixture ID trong một request, ETL phải ưu tiên batch IDs thay vì một request cho từng trận. Mục tiêu là giảm request count, không phải giảm số dữ liệu. 

## **6. Data model** 

|**Bảng**|**Mục đích**|**Khóa chính / quan trọng**|
|---|---|---|
|competitions|6 giải đấu và metadata|competition_id|
|seasons|Mùa 2026/27|season_id, competition_id|
|teams|Đội bóng|team_id|
|venues|Sân vận động|venue_id|
|matches|Fixture + score + status|match_id / api_fixture_id UNIQUE|
|match_events|Goal/cards/substitution/VAR|event_id|
|match_statistics|Team statistics theo trận|match_id + team_id|
|lineups|Đội hình trận|match_id + team_id + player_id|



World Football Analytics Platform — Business Analysis 

Trang 2 

|player_match_stats|Thống kê cầu thủ|match_id + player_id|
|---|---|---|
|standings_snapshots|BXH theo thời điểm|competition + season + snapshot|
|odds_snapshots|Odds theo bookmaker/thời điểm|match + market + selection + snapshot|
|etl_runs|Theo dõi pipeline|run_id|



World Football Analytics Platform — Business Analysis 

Trang 3 

## **7. Các KPI chính** 

|**KPI**|**Định nghĩa**|
|---|---|
|Total Matches|Số trận đã/đang được ghi nhận trong phạm vi filter|
|Total Goals|Tổng bàn thắng hợp lệ|
|Avg Goals/Match|Total Goals / Finished Matches|
|Avg Corners|Tổng corners / Finished Matches|
|Avg Yellow Cards|Tổng yellow cards / Finished Matches|
|Avg Red Cards|Tổng red cards / Finished Matches|
|BTTS Rate|Số trận cả hai đội ghi bàn / Finished Matches|
|Clean Sheet Rate|Số trận một đội giữ sạch lưới / số cơ hội tương ứng|
|Over 2.5 Rate|Số trận tổng bàn > 2.5 / Finished Matches|
|Home Win Rate|Số trận chủ thắng / Finished Matches|
|Draw Rate|Số trận hòa / Finished Matches|
|Away Win Rate|Số trận khách thắng / Finished Matches|



## **8. Team Analytics** 

Mỗi đội phải có trang/record tổng hợp gồm: matches, wins, draws, losses, goals for/against, average goals for/against, clean sheets, BTTS, corners for/against, cards, shots, possession và các chỉ số betting nếu odds đủ coverage. 

Nên có thêm các filter: competition, season, team, home/away, date range, match status. 

## **9. Betting Analytics** 

Betting data phải được lưu thành snapshot theo timestamp; không overwrite odds cũ nếu mục tiêu là phân tích line movement. 

|**Nhóm**|**Chỉ số**|
|---|---|
|Asian Handicap|Handicap line, odds, win/push/loss, cover rate|
|Over/Under|Line, odds, Over/Under result, hit rate|
|Match Winner|Home/Draw/Away odds và kết quả|
|Movement|Opening/latest line nếu dữ liệu đủ coverage|



## **10. Quy tắc tính Handicap** 

Phải xây dựng một module settlement riêng. Không hard-code 'thắng kèo' chỉ dựa trên tỷ số. Module nhận: home_score, away_score, market, handicap_line và trả về WIN / PUSH / LOSS / VOID / UNKNOWN. 

Ví dụ Asian Handicap -1.0: nếu đội được chấp thắng đúng 1 bàn thì PUSH; thắng hơn 1 bàn thì WIN; thắng không đủ hoặc hòa/thua thì LOSS. Các line quarter-ball như -0.25, -0.75 phải được tách thành hai nửa kèo. 

## **11. ETL Pipeline** 

World Football Analytics Platform — Business Analysis 

Trang 4 

```
1. Determine active competitions/seasons
```

`2. Determine UPCOMING / LIVE / FINISHED fixtures` 

```
3. Build minimum request plan
```

```
4. Fetch API in batches
```

```
5. Validate response
6. Store raw payload / ingestion metadata
```

`7. Upsert normalized tables` 

`8. Recalculate affected analytics` 

```
9. Record ETL run + quota remaining
10. Exit successfully
```

## **12. API quota guard** 

Mọi API response phải được kiểm tra header quota nếu API trả về. Hệ thống lưu request count và trạng thái quota vào bảng etl_runs. Khi quota còn thấp, chỉ chạy critical jobs: LIVE/FINISHED reconciliation. Không retry vô hạn. 

Retry nên dùng exponential backoff cho lỗi tạm thời; HTTP 429 phải dừng hoặc defer job thay vì tiếp tục gọi. 

## **13. GitHub Actions** 

Không cần duy trì server 24/7. Dùng scheduled workflow để khởi chạy Python ETL. Có thể tách workflow theo nhiệm vụ nhưng MVP nên giữ một workflow chính để dễ kiểm soát quota. 

```
name: Football Data ETL
```

```
on:
schedule:
- cron: "*/15 * * * *"
workflow_dispatch:
jobs:
etl:
runs-on: ubuntu-latest
steps:
- checkout
- setup-python
- pip install -r requirements.txt
- python -m src.etl.run
```

Lưu ý: cron 15 phút chỉ là lịch kích hoạt. ETL bên trong phải quyết định có cần gọi API hay không. Nếu không có trận LIVE/FINISHED cần cập nhật thì job có thể kết thúc gần như ngay lập tức. 

## **14. Secrets & Security** 

Không commit API key hoặc DATABASE_URL. Lưu chúng trong GitHub Actions Secrets. Python đọc từ environment variables. Database phải yêu cầu TLS/SSL nếu provider hỗ trợ. 

## **15. Data Quality** 

|**Rule**|**Yêu cầu**|
|---|---|
|Duplicate|api_fixture_id UNIQUE; ETL phải idempotent|
|Score|Không cho score âm; xử lý null cho trận chưa kết thúc|
|Status|Chuẩn hóa status API thành enum nội bộ|
|Team|Không duplicate team theo api_team_id|
|Statistics|Không biến null thành 0 nếu API thực sự không có dữ liệu|



World Football Analytics Platform — Business Analysis 

Trang 5 

|Odds|Mỗi snapshot phải có timestamp và bookmaker/market|
|---|---|
|Reconciliation|Sau FT có final refresh để sửa dữ liệu tạm thời|



World Football Analytics Platform — Business Analysis 

Trang 6 

## **16. Dashboard Specification** 

Overview: 6 giải đấu; total matches; goals; avg goals; corners; cards; BTTS; Over 2.5; last update; active live matches. 

Competition: Chọn một trong 6 giải; standings; team rankings; goal/corner/card distributions; recent results; upcoming matches. 

Team: Form, W/D/L, goals, clean sheets, BTTS, corners, cards, shots, home/away split, optional betting performance. 

Match: Score, timeline, team stats, lineups, events, odds snapshot và timestamp cập nhật. 

Betting: AH/O-U/1X2; hit rate; push; sample size; bookmaker; line movement nếu coverage đủ. 

## **17. Analytics Views nên tạo** 

- vw_competition_summary 

- vw_team_season_stats 

- vw_team_home_away_stats 

- vw_match_summary 

- vw_goals_distribution 

- vw_cards_corners_summary 

- vw_betting_settlement 

- vw_odds_movement 

- vw_latest_matches 

- vw_upcoming_matches 

- vw_live_matches 

## **18. MVP Roadmap** 

|**Phase**|**Deliverable**|
|---|---|
|1|API connection + xác định league/season IDs + test coverage|
|2|PostgreSQL schema + migrations + indexes|
|3|Fixture ingestion + score/status + idempotent upsert|
|4|Events + team statistics + final reconciliation|
|5|GitHub Actions + quota guard + logging|
|6|SQL analytics + views|
|7|Power BI dashboard|
|8|Odds + handicap settlement|
|9|Testing + README + architecture diagram|



## **19. Definition of Done** 

- Có dữ liệu cho đủ 6 competition của mùa 2026/27. 

World Football Analytics Platform — Business Analysis 

Trang 7 

- ETL chạy được bằng một lệnh local và bằng GitHub Actions. 

- Job có idempotency và không tạo duplicate. 

- Có cơ chế smart polling và quota guard. 

- Có PostgreSQL schema rõ ràng và indexes. 

- Có analytics SQL cho giải, đội và trận. 

- Có dashboard overview + competition + team + match. 

- Có logging, error handling và ETL run history. 

- API key không xuất hiện trong Git repository. 

- README mô tả kiến trúc, setup, data model, API quota và cách chạy. 

## **20. Nguồn và ghi chú API-Football** 

Nguồn chính thức tham khảo khi thiết kế tài liệu: API-Football Pricing, Coverage, Documentation, How Rate Limit Works và hướng dẫn tối ưu quota. Tại thời điểm lập tài liệu (30/08/2026), Free plan được công bố 100 requests/day và 10 requests/minute; API-Football cũng công bố coverage cho Premier League, La Liga, Serie A, Bundesliga, Ligue 1 và Champions League. Các endpoint/field cụ thể phải được kiểm tra lại bằng Live Tester/Documentation trước khi triển khai vì coverage có thể khác nhau theo competition/season. 

https://www.api-football.com/pricing https://www.api-football.com/coverage https://www.api-football.com/documentation-v3 https://www.api-football.com/news/post/how-ratelimit-works https://www.api-football.com/news/post/how-to-optimize-api-sports-calls-and-quota-usage 

Gợi ý triển khai: bắt đầu bằng một competition (Premier League) để hoàn thiện end-to-end pipeline, sau đó mở rộng config sang 5 giải còn lại. Không hard-code logic theo tên giải; dùng competition_id + season_id làm khóa cấu hình để hệ thống mở rộng được. 

World Football Analytics Platform — Business Analysis 

Trang 8 

