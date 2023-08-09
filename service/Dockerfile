# 使用官方的 Node.js 镜像作為基礎
FROM node:16

# 創建工作目錄
WORKDIR /usr/src/app

# 將 package.json 和 package-lock.json 文件複製到工作目錄
COPY package*.json ./

# 安裝應用程序的依賴
RUN npm ci

# 將應用程序的源碼複製到工作目錄
COPY . .

# 暴露應用程序使用的端口（如果有的話）
EXPOSE 3000

# 啟動應用程序
CMD [ "node", "index.js", "--batch", "4", "--upscale" ]
