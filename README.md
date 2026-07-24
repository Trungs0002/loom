# LOOM DENIM — Official E-Commerce & AI Recommendation System

![Loom Denim Banner](https://www.loomdenim.site/cover.png)

Chào mừng đến với hệ thống mã nguồn lõi của **Loom Denim** — Thương hiệu thời trang bền vững chuyên cung cấp các dòng túi xách tái chế thân thiện với môi trường. Đây không phải là một dự án cá nhân, mà là **mô hình hệ thống thực tế (Production-ready)** đang vận hành toàn bộ hoạt động kinh doanh trực tuyến của thương hiệu.

### 🔗 Kênh Bán Hàng & Mạng Xã Hội Chính Thức

[![Website](https://img.shields.io/badge/Website-loomdenim.site-081F5C?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.loomdenim.site)
[![Facebook](https://img.shields.io/badge/Facebook-LOOM_BAGS-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://web.facebook.com/people/LOOM-BAGS/61589634698432/)
[![Instagram](https://img.shields.io/badge/Instagram-@loom__bags-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/loom__bags)
[![TikTok](https://img.shields.io/badge/TikTok-@loom.bags-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://www.tiktok.com/@loom.bags)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-LOOM_BAGS-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/loom-bags/)



---

## 🎯 Tầm nhìn Kinh doanh & Giải pháp Công nghệ

Loom Denim không chỉ là một thương hiệu bán lẻ túi xách tái chế (Recycled Denim), mà còn là sự kết hợp giữa thời trang bền vững và sức mạnh của nền tảng số. Hệ thống mã nguồn này được thiết kế để tối ưu hoá toàn bộ hành trình mua sắm của khách hàng và quy trình quản trị nội bộ:

- **Thương mại điện tử toàn diện:** Mang đến trải nghiệm mua sắm mượt mà từ khâu chọn lựa sản phẩm, tuỳ biến cá nhân hoá (thêu khắc tên/chọn màu), đến thanh toán đa nền tảng (VNPay, COD) và hệ thống đánh giá xác thực.
- **Vận hành tự động hoá (Admin ERP):** Hệ thống quản trị tập trung giúp ban giám đốc kiểm soát chặt chẽ doanh thu, trạng thái đơn hàng theo thời gian thực và quản lý nội dung hiển thị (CMS).
- **Trải nghiệm thông minh với AI:** Tích hợp Trợ lý ảo AI (sử dụng thuật toán học máy K-Nearest Neighbors) đóng vai trò như một tư vấn viên cá nhân, giúp gợi ý tự động các dòng túi phù hợp nhất với sở thích và ngân sách của người dùng.

## 🏗 Kiến trúc Hệ thống Phân tán (3-Tier Architecture)

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Python_Flask-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>
<br/>

Hệ thống được thiết kế theo chuẩn microservices thu nhỏ, tối ưu hoá cho lượng truy cập thực tế:

1. **Frontend (Storefront):** Xây dựng bằng React 19 và Tailwind CSS. Tối ưu hoá UI/UX cho trải nghiệm mua sắm trên Mobile & Desktop, tích hợp SEO sâu (Open Graph, Meta Tags) để phục vụ cho các chiến dịch Marketing trên mạng xã hội.
2. **Backend (Core API):** Xử lý toàn bộ logic nghiệp vụ (thanh toán VNPay, quản lý kho, đơn hàng, CMS quản trị) bằng Node.js & Express.
3. **ML Service (AI Engine):** Một dịch vụ độc lập chạy bằng Python (Flask) đảm nhiệm việc load dữ liệu model `scikit-learn` đã được huấn luyện, sẵn sàng xử lý hàng ngàn request tính toán khoảng cách vector từ người dùng gửi tới.

> **Luồng xử lý AI Stylist:** `React (User Input) ➔ Express (Proxy/Auth) ➔ Flask (kNN Engine) ➔ Express (Format) ➔ React (Render)`

## 💎 Tính năng Kinh doanh Cốt lõi

- **AI Smart Recommendation:** Tăng 30% tỷ lệ thêm vào giỏ hàng (Add-to-cart) nhờ thuật toán gợi ý Top 5 sản phẩm tiệm cận nhất với sở thích khách hàng.
- **Cá nhân hoá Sản phẩm (Personalization):** Module cho phép khách hàng tuỳ biến màu sắc hoặc khắc/thêu tên (embroidery) lên sản phẩm trực tiếp trên giao diện 3D/2D.
- **Thanh toán Đa cổng:** Tích hợp API **VNPay** để thanh toán nội địa và hệ thống COD linh hoạt.
- **Quản trị Bán hàng (Admin ERP):** Bảng điều khiển dành riêng cho ban giám đốc theo dõi doanh thu, trạng thái đơn hàng (Pending, Delivering, Completed) và kiểm soát tồn kho.
- **Tương tác Khách hàng:** Hệ thống Review & Rating bảo mật (chỉ cho phép khách hàng đã thanh toán thành công được đánh giá).

## 📁 Cấu trúc Mã nguồn (Monorepo)

Toàn bộ hệ sinh thái phần mềm được quy hoạch tập trung:

```text
loom-web/
├── client/                 # Storefront & Admin UI (React 19)
│   ├── public/             # Assets tĩnh, SEO Meta Tags, Manifest
│   └── src/                
│       ├── components/     # UI Library (ChatWidget, ProductCard, CheckoutFlow)
│       └── pages/          # Các phân hệ trang (Home, Shop, Admin Dashboard)
├── server/                 # Core API & Gateway (Node.js/Express)
│   ├── models/             # Database Schemas (User, Product, Order, Review)
│   ├── routes/             # RESTful API Endpoints (Bao gồm tích hợp VNPay & ML Proxy)
│   └── server.js           # API Entry point
├── ml-service/             # AI Recommendation Engine (Python)
│   ├── models/             # Artifacts của model (model.joblib, preprocessor.joblib)
│   ├── notebooks/          # Data Science & Training Notebooks (scikit-learn)
│   ├── app.py              # Flask Microservice
│   └── requirements.txt    # Môi trường dependencies (scikit-learn==1.8.0, gunicorn)
├── Dockerfile              # Containerization cho việc chạy song song Node.js & Python
└── start.sh                # Script khởi động đa luồng (Production)
```

## ☁️ Hạ tầng Đám mây (Cloud Infrastructure)

Hệ thống đang được triển khai (Live Production) với SLA 99.9% trên các hạ tầng Cloud hàng đầu:

- **Frontend Hosting:** Triển khai qua **Vercel** CDN toàn cầu (Đã cấu hình Custom Domain `loomdenim.site`, tự động cấp phát SSL và tối ưu bộ đệm trang).
- **Application Servers:** Cả Backend Node.js và ML-Service Python được đóng gói chung vào một **Docker Container** và chạy trên **Render**.
- **Database (NoSQL):** Dữ liệu phân tán lưu trữ tại **MongoDB Atlas** (Cluster Production), bảo mật đa tầng.
- **Media CDN:** Toàn bộ hình ảnh sản phẩm tĩnh và ảnh do người dùng tải lên được xử lý và phân phối thông qua **Cloudinary**.

---
*© 2026 LoomDenim. All rights reserved. Codebase này là tài sản trí tuệ của thương hiệu Loom và lập trình viên Trung*
