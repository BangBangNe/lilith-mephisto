# Lilith × Mephisto — hướng dẫn

## Mở web
- Nhanh nhất: mở `index.html` bằng Chrome/Edge (cần có mạng để tải font + GSAP).
- Thêm `?skip` vào cuối địa chỉ để bỏ qua màn loading khi đang sửa.
- Thêm `?clean` để ẩn chữ mô tả trên các ô tranh trống (lúc khoe web cho mọi người).

## Thêm tranh
Chỉ cần **thả file vào `assets/img/` đúng tên** bên dưới là web tự hiện tranh, ô trống tự biến mất.
Đuôi file nào cũng được: `.webp` `.png` `.jpg` `.gif`.

| Tên file | Vị trí | Gợi ý nội dung | Tỉ lệ |
|---|---|---|---|
| `hero-key` | Nền màn hình đầu | Lilith & Mephisto lưng kề lưng giữa trời sao, bướm xanh bay quanh | Ngang 16:9 |
| `lilith-cut` | Hero + thẻ nhân vật | Full body Lilith **nền trong suốt** (đang dùng bản pixel đã tách nền) | Dọc |
| `mephisto-full` | Thẻ nhân vật | Full body Mephisto (đang dùng tạm ảnh manga) | Dọc 3:4 |
| `azel` | Nhân vật phụ | Chân dung Azel — anh trai siscon | Vuông / dọc |
| `pets` | Nhân vật phụ | Lilith chơi với thú cưng trong vườn kính | Vuông / dọc |
| `ability-illusion` | Nền phần Huyễn Tâm | Lilith kích hoạt năng lực: không gian vỡ như gương, mắt chữ thập phát sáng | Ngang |
| `pov-lilith` | Hai góc nhìn | Lilith ngước nhìn lên, ánh mắt tin cậy | Dọc 4:5 |
| `pov-mephisto` | Hai góc nhìn | Mephisto nhìn xuống, cười nhẹ, dịu dàng mà chiếm hữu | Dọc 4:5 |
| `ch1-neighbors` | Chương I | Hai dinh thự cạnh nhau, Lilith bé nấp sau Azel nhìn qua hàng rào hoa | Ngang 4:3 |
| `ch2-azel` | Chương II | Azel & Mephisto nhỏ quàng vai, Lilith bám vạt áo anh trai | Ngang 4:3 |
| `ch3-sworn` | Chương III | Mephisto xoa đầu Lilith, tông ấm hoài niệm | Ngang 4:3 |
| `ch4-realize` | Chương IV | Mephisto đứng ngoài vườn kính nhìn Lilith ngủ quên giữa hoa, ánh trăng xanh | Ngang 4:3 |
| `ch5-teatime` | Chương V | (đang dùng sketch tea time) — thay bằng bản màu khi xong | Ngang 4:3 |
| `ch6-babyls` | Chương VI | Lilith giảng bài ở Babyls, Mephisto dựa cửa lớp | Ngang 4:3 |
| `ch7-future` | Chương ? | Tuỳ bạn — gợi ý: tỏ tình dưới tuyết | Ngang 4:3 |
| `g-snow` | Gallery | Lilith nghịch tuyết, Mephisto quàng khăn cho em | Tự do |
| `g-hug` | Gallery | Lilith ôm Mephisto từ phía sau | Tự do |
| `g-perfume` | Gallery | Mephisto tặng nước hoa giữa kệ sưu tập của em | Ngang |
| `g-mask` | Gallery | Lilith cầm mặt nạ: nửa kiêu sa, nửa phụng phịu | Tự do |
| `g-chibi` | Gallery | Chibi Azel & Mephisto giành ghế cạnh Lilith | Tự do |
| `outro` | Nền đoạn kết | Hai bàn tay đan nhau, bướm xanh đậu lên, tông tối | Ngang |
| `og-cover` | Ảnh preview khi share link | Ảnh bìa | 1200×630 |

## Nhạc nền
Thả `assets/audio/bgm.mp3` vào là nút nhạc (góc phải trên) tự hiện.

## Sửa chữ
Mọi nội dung nằm trong `index.html`. Những chỗ có `✎` là chỗ nên sửa/thêm.
Thông tin Mephisto còn trống nằm ở các ô có class `todo`.
Thêm chương: copy 1 khối `<article class="chapter">`. Thêm tranh gallery: copy 1 khối `<figure class="gitem">`
(thêm `gitem--tall` cho tranh dọc, `gitem--wide` cho tranh ngang).

## Đổi màu
Sửa các biến trong `:root` ở đầu `css/style.css`.

## Đưa lên mạng (miễn phí)
Kéo thả cả thư mục vào https://app.netlify.com/drop, hoặc đẩy lên GitHub Pages.
