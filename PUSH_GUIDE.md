# 🚀 推送代码到 GitHub 指南

由于SSH密钥配置问题，需要手动推送代码。请按以下步骤操作：

## 方法一：使用 HTTPS（推荐）

### 1. 设置远程仓库

```bash
cd "/Users/magicalaci/Downloads/AI code/死了不/DeadYet"
git remote remove origin 2>/dev/null
git remote add origin https://github.com/MagicalAci/DeadYet.git
```

### 2. 推送代码

```bash
git push -u origin main
```

系统会提示输入 GitHub 用户名和密码（Personal Access Token）。

### 3. 如果没有 Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo` (全部)
4. 生成并复制 Token
5. 推送时用 Token 代替密码

## 方法二：使用 SSH

### 1. 生成新的 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### 2. 添加到 SSH Agent

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 3. 复制公钥

```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```

### 4. 添加到 GitHub

1. 访问 https://github.com/settings/keys
2. 点击 "New SSH key"
3. 粘贴公钥并保存

### 5. 推送代码

```bash
cd "/Users/magicalaci/Downloads/AI code/死了不/DeadYet"
git remote remove origin 2>/dev/null
git remote add origin git@github.com:MagicalAci/DeadYet.git
git push -u origin main
```

## 方法三：使用 GitHub Desktop

1. 下载 [GitHub Desktop](https://desktop.github.com)
2. 登录你的 GitHub 账号
3. File → Add Local Repository
4. 选择 `/Users/magicalaci/Downloads/AI code/死了不/DeadYet`
5. 点击 "Publish repository"

## 验证推送成功

推送成功后，访问 https://github.com/MagicalAci/DeadYet 应该能看到所有代码。

---

**推送完成后，就可以开始在 Zeabur 部署后端了！** 🎉

