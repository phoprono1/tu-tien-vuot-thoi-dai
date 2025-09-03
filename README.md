# Tu Tiên Vượt Thời Đại 🌟

**PRODUCTION READY FOR VERCEL DEPLOYMENT**

Tu Tiên MMO Web Game - Một thế giới tu tiên đầy thách thức với 3 con đường tu luyện khác nhau!

✅ **Optimized for 100-200 concurrent players**  
✅ **PWA with offline support**  
✅ **Realtime multiplayer with Appwrite**  
✅ **Mobile-first responsive design**  
✅ **Zero-config Vercel deployment**

## ⚡ Tính năng chính

### 🎯 Ba con đường tu luyện

- **Khí Tu**: Con đường truyền thống, cân bằng và ổn định
- **Thể Tu**: Tôi luyện thể phách, chậm nhưng mạnh mẽ
- **Ma Tu**: Con đường tà đạo, nguy hiểm nhưng quyền năng

### 🌩️ Hệ thống thiên kiếp

- Vượt qua thử thách của trời đất để đột phá
- Mỗi con đường tu luyện có cơ chế thiên kiếp riêng
- Ma tu có thể chống lại thiên kiếp bằng sát khí

### ⚔️ Tính năng MMO

- **PvP Combat**: Chiến đấu thời gian thực với người chơi
- **Guild System**: Tham gia bang phái, chinh phục lãnh thổ
- **Real-time Chat**: Tương tác với cộng đồng
- **Boss Raids**: Hợp tác tiêu diệt boss mạnh

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Appwrite (BaaS)
- **Database**: Appwrite Database
- **Authentication**: Appwrite Auth
- **Real-time**: Appwrite Realtime
- **Storage**: Appwrite Storage

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Tài khoản Appwrite

### Cài đặt

1. Clone repository:

```bash
git clone https://github.com/your-username/tu-tien-vuot-thoi-dai.git
cd tu-tien-vuot-thoi-dai
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Cấu hình Appwrite:
   - Tạo project mới trên [Appwrite Console](https://cloud.appwrite.io)
   - Copy Project ID và Endpoint
   - Tạo file `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=tu-tien-database
```

4. Chạy development server:

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 📁 Cấu trúc dự án

```
src/
├── app/                    # App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utilities
│   └── appwrite.ts       # Appwrite configuration
├── types/                # TypeScript types
│   └── game.ts           # Game-related types
└── styles/               # Additional styles
```

## 🎮 Gameplay

### Bắt đầu game

1. Đăng ký tài khoản
2. Tạo nhân vật và chọn con đường tu luyện
3. Hoàn thành hướng dẫn cơ bản
4. Bắt đầu hành trình tu tiên

### Cơ chế tu luyện

- **Hấp thụ linh khí**: Tự động theo thời gian
- **Đột phá cảnh giới**: Vượt qua thiên kiếp
- **Tăng sức mạnh**: Qua chiến đấu và tu luyện
- **Thu thập tài nguyên**: Từ PvP, PvE và khám phá

## 🔮 Roadmap

### Phase 1 (MVP) ✅

- [x] Thiết lập dự án Next.js + Appwrite
- [x] Giao diện landing page
- [x] Cấu hình cơ bản

### Phase 2 (Core Game)

- [ ] Hệ thống đăng ký/đăng nhập
- [ ] Tạo và quản lý nhân vật
- [ ] Hệ thống tu luyện cơ bản
- [ ] Ba con đường tu luyện

### Phase 3 (MMO Features)

- [ ] Chat system real-time
- [ ] PvP combat system
- [ ] Guild management
- [ ] Boss raid system

### Phase 4 (Advanced)

- [ ] Mobile responsive
- [ ] Advanced graphics
- [ ] More cultivation paths
- [ ] Economy system

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## 📝 License

Dự án được phát hành dưới license [MIT](LICENSE).

## 📞 Liên hệ

- **Email**: contact@tutien-game.com
- **Discord**: [Tu Tiên Community](https://discord.gg/tutien)
- **Facebook**: [Tu Tiên Vượt Thời Đại](https://facebook.com/tutienvuotthoidad)

---

_Thế giới tu tiên gặp gỡ khoa học hiện đại - Hành trình bất tử bắt đầu từ đây!_ ⚡🧬
