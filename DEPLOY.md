# infinite-story 飞牛 NAS 部署教程（零基础版）

本教程会一步一步教你把网站部署到家里的飞牛 NAS 上，并让外网也能访问。

---

## 你需要准备的东西

1. **飞牛 NAS**（已装好 Docker，保持开机）
2. **一台 Windows 电脑**（和 NAS 在同一个家里网络下）
3. **一个 Cloudflare 账号**（免费注册，后面让外网访问用的）

---

## 第一步：把项目文件传到 NAS

### 1.1 找到你 NAS 的 IP 地址

- 打开飞牛的管理后台（浏览器输入 `http://fnos.local` 或者看 NAS 屏幕上显示的 IP）
- 记下这个 IP 地址，比如 `192.168.1.100`（你的可能是别的数字）

### 1.2 通过网络共享复制文件

1. 打开 Windows 文件管理器（就是"此电脑"那个窗口）
2. 地址栏输入 `\\你的NAS的IP`，比如 `\\192.168.1.100`，回车
3. 可能需要输入 NAS 的用户名和密码
4. 找到一个叫 `docker` 的共享文件夹（如果没有就找 `public` 或者你自己建一个）
5. 把你电脑上的 `infinite-story` 整个文件夹复制进去

复制完之后，NAS 上的路径应该是类似 `/vol1/docker/infinite-story/` 这样的。

---

## 第二步：打开 NAS 的 SSH 功能

你需要通过"命令行"来操作 NAS，这需要先开启 SSH。

1. 打开飞牛的管理后台网页
2. 找到 **系统设置** → **SSH**（或者"远程连接"）
3. 把 SSH 开关打开
4. 记下 SSH 端口，一般是 `22`

---

## 第三步：连接到 NAS 并执行命令

### 3.1 打开命令行窗口

1. 在你的 Windows 电脑上，按键盘 `Win + R`（Win 键就是那个 Windows 图标键）
2. 弹出的框里输入 `cmd`，按回车
3. 会打开一个黑色的命令行窗口

### 3.2 连接 NAS

在黑色窗口里输入以下命令（把 `192.168.1.100` 换成你 NAS 的实际 IP）：

```
ssh root@192.168.1.100
```

- 第一次连接会问你 `Are you sure you want to continue connecting?`，输入 `yes` 回车
- 然后输入 NAS 的密码（输入时密码不会显示，输完直接回车）
- 看到类似 `root@fnos:~#` 的提示符就表示连接成功了

> 如果 `ssh` 命令不可用，说明你的 Windows 版本较老。可以下载安装 [PuTTY](https://www.putty.org/) 来连接，操作类似。

---

## 第四步：修改配置文件

### 4.1 进入项目目录

输入以下命令（注意大小写要完全一致）：

```bash
cd /vol1/docker/infinite-story
```

> 解释：`cd` 是"进入文件夹"的意思。

### 4.2 生成一个随机密钥

输入：

```bash
openssl rand -base64 32
```

屏幕上会输出一串类似 `aB3dEf5gH7iJ9kL1mN3oP5qR7sT9uV1wX` 的字符。
**右键选中 → 复制这串字符**，等下要用。

### 4.3 编辑配置文件

输入：

```bash
nano .env.production
```

> 解释：`nano` 是一个简单的文本编辑器。

你会看到文件内容，用键盘上的方向键移动光标，修改以下几行：

```
NEXTAUTH_SECRET=粘贴刚才复制的那串密钥
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
MINIMAX_API_KEY=你的MiniMax密钥（就是你原来.env里的那个sk-开头的）
MINIMAX_GROUP_ID=
```

- `NEXTAUTH_URL` 和 `NEXT_PUBLIC_BASE_URL` **先保持 `http://localhost:3000` 不改**，等后面配好域名再改
- `MINIMAX_API_KEY` 用你原来 `.env` 文件里的那个值

修改完后：
1. 按 `Ctrl + O`（保存，会问你文件名，直接按回车确认）
2. 按 `Ctrl + X`（退出编辑器）

---

## 第五步：构建并启动网站

依次输入以下三条命令，每输一条等它跑完再输下一条：

**第 1 条：构建 Docker 镜像（第一次需要 5-10 分钟，请耐心等待）**

```bash
docker compose build
```

你会看到很多输出文字在滚动，这是正常的。最后看到 `FINISHED` 就是成功了。

**第 2 条：启动网站**

```bash
docker compose up -d
```

看到类似 `Container infinite-story-app-1 Started` 就是成功了。

**第 3 条：查看运行日志（确认启动正常）**

```bash
docker compose logs -f
```

等几秒钟，看到类似这样的文字就是启动成功了：

```
▲ Next.js 16.x.x
- Local: http://0.0.0.0:3000
```

看到之后按 `Ctrl + C` 退出日志查看（不会停止网站）。

### 测试局域网访问

在你的 Windows 电脑浏览器里输入 `http://你NAS的IP:3000`，比如 `http://192.168.1.100:3000`。

如果能看到网站页面，说明部署成功！接下来配置外网访问。

---

## 第六步：配置外网访问（Cloudflare Tunnel）

这一步让外网也能访问你家里的网站，**不需要公网 IP，不需要买服务器**。

### 6.1 注册 Cloudflare 账号

1. 打开浏览器，访问 `https://dash.cloudflare.com/sign-up`
2. 用邮箱注册一个免费账号
3. 注册完会进入控制台

### 6.2 添加你的域名

> 如果你没有域名，可以去阿里云/腾讯云买一个 `.com` 域名，一年几十块钱。
> 如果暂时不想买域名，可以跳到下面的「方案 A：临时域名（测试用）」。

**有域名的操作：**

1. 在 Cloudflare 控制台，点 **Add a domain**
2. 输入你的域名，比如 `example.com`，点 Continue
3. 选择 **Free** 免费方案，点 Continue
4. Cloudflare 会给你两个 DNS 服务器地址，类似：
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
5. 去你买域名的网站（阿里云/腾讯云等），找到域名管理 → DNS 服务器，把原来的替换成 Cloudflare 给的这两个
6. 回到 Cloudflare 点 **Continue**，等几分钟验证通过

### 6.3 创建隧道

1. 在 Cloudflare 控制台左侧菜单，点 **Zero Trust**
2. 可能会让你创建一个团队名（随便起一个就行，比如 `mystory`）
3. 左侧菜单 → **Networks** → **Tunnels**
4. 点 **Create a tunnel**
5. 选择 **Cloudflared**，点 Next
6. 给隧道起个名字，比如 `infinite-story`，点 Save tunnel
7. 页面上会显示一个很长的 token 命令，类似：
   ```
   docker run -d ... cloudflare/cloudflared:latest tunnel --no-autoupdate run --token eyJxxxx很长的一串xxxx
   ```
8. **复制这整个命令**，等下要用

### 6.4 在 NAS 上运行隧道

回到你的 SSH 命令行窗口，**粘贴刚才复制的那个命令**，回车执行。

看到类似 `Registered connection` 就是成功了。

### 6.5 配置域名指向

1. 回到 Cloudflare 控制台的隧道页面
2. 点刚创建的隧道名称
3. 点 **Configure** 或 **Public Hostname** 标签
4. 点 **Add a public hostname**
5. 填写：
   - **Subdomain**: 填 `story`（或你喜欢的前缀）
   - **Domain**: 选你的域名
   - **Service**: 选 `HTTP`，地址填 `localhost:3000`
6. 点 **Save hostname**

### 6.6 更新网站配置

回到 SSH 命令行，输入：

```bash
cd /vol1/docker/infinite-story
nano .env.production
```

把这两行改成你的正式域名：

```
NEXTAUTH_URL=https://story.你的域名.com
NEXT_PUBLIC_BASE_URL=https://story.你的域名.com
```

保存退出（`Ctrl + O` → 回车 → `Ctrl + X`），然后重启网站：

```bash
docker compose restart
```

等几秒钟，然后在浏览器访问 `https://story.你的域名.com`，应该就能看到你的网站了！

---

### 方案 A：临时域名（不想买域名 / 先测试）

如果你暂时没有域名，可以用 Cloudflare 提供的免费临时域名来测试：

1. 回到 SSH 命令行
2. 输入：

```bash
docker run -d --name cloudflared --network host cloudflare/cloudflared:latest tunnel --url http://localhost:3000
```

3. 等几秒后输入：

```bash
docker logs cloudflared
```

4. 在输出的日志里找这样一行：

```
Visit it at: https://xxxx-xxxx-xxxx.trycloudflare.com
```

5. 复制那个 `https://xxxx-xxxx-xxxx.trycloudflare.com` 地址，在浏览器打开就能访问了

> 注意：这个临时域名每次重启 cloudflared 容器后会变。正式使用建议买个域名。

---

## 常见问题

### Q: 构建失败了怎么办？

看错误信息。最常见的原因是网络问题（下载依赖超时）。可以多试几次：

```bash
docker compose build --no-cache
```

### Q: 网站打不开？

检查日志：

```bash
docker compose logs -f
```

看看有没有报错信息。

### Q: 怎么重启网站？

```bash
cd /vol1/docker/infinite-story
docker compose restart
```

### Q: 怎么更新代码？

把新代码覆盖到 NAS 上的 `infinite-story` 文件夹，然后：

```bash
cd /vol1/docker/infinite-story
docker compose up -d --build
```

### Q: 数据会不会丢？

不会。网站的数据（用户、小说等）存在 `infinite-story/data/prod.db` 文件里，这个文件在 NAS 的硬盘上，重建容器也不会丢。

建议偶尔备份这个文件：

```bash
cp /vol1/docker/infinite-story/data/prod.db /vol1/docker/infinite-story/data/prod.db.backup
```

---

## 一句话总结

整个流程就是：**传文件 → 连 NAS → 改配置 → docker compose up → 配 Cloudflare Tunnel → 完成**。
