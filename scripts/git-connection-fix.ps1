# Git连接问题诊断和修复脚本
# 用于解决Git连接重置、代理问题等常见网络连接问题

Write-Host "=== Git连接问题诊断和修复工具 ===" -ForegroundColor Green
Write-Host ""

# 1. 检查当前Git配置
Write-Host "1. 检查当前Git远程仓库配置..." -ForegroundColor Yellow
git remote -v
Write-Host ""

# 2. 检查代理设置
Write-Host "2. 检查Git代理设置..." -ForegroundColor Yellow
$proxyConfig = git config --list | Select-String -Pattern "proxy"
if ($proxyConfig) {
    Write-Host "发现代理配置:" -ForegroundColor Red
    $proxyConfig
    Write-Host ""
    
    # 测试代理连接
    Write-Host "3. 测试代理连接..." -ForegroundColor Yellow
    $httpsProxy = git config --get https.proxy
    $httpProxy = git config --get http.proxy
    
    if ($httpsProxy -or $httpProxy) {
        $proxyUrl = if ($httpsProxy) { $httpsProxy } else { $httpProxy }
        Write-Host "测试代理: $proxyUrl" -ForegroundColor Cyan
        
        # 提取代理地址和端口
        if ($proxyUrl -match "http://([^:]+):(\d+)") {
            $proxyHost = $matches[1]
            $proxyPort = $matches[2]
            
            try {
                $testResult = Test-NetConnection -ComputerName $proxyHost -Port $proxyPort -WarningAction SilentlyContinue
                if ($testResult.TcpTestSucceeded) {
                    Write-Host "代理端口可达，但可能无法访问GitHub" -ForegroundColor Yellow
                } else {
                    Write-Host "代理端口不可达" -ForegroundColor Red
                }
            } catch {
                Write-Host "代理测试失败: $_" -ForegroundColor Red
            }
        }
        
        # 提供修复选项
        Write-Host ""
        Write-Host "=== 修复选项 ===" -ForegroundColor Green
        Write-Host "选择修复方案:"
        Write-Host "1. 临时禁用代理"
        Write-Host "2. 永久禁用代理"
        Write-Host "3. 重新配置代理"
        Write-Host "4. 跳过修复"
        
        $choice = Read-Host "请输入选择 (1-4)"
        
        switch ($choice) {
            "1" {
                Write-Host "临时禁用代理..." -ForegroundColor Cyan
                git config --global --unset http.proxy 2>$null
                git config --global --unset https.proxy 2>$null
                Write-Host "代理已临时禁用" -ForegroundColor Green
            }
            "2" {
                Write-Host "永久禁用代理..." -ForegroundColor Cyan
                git config --global --unset http.proxy 2>$null
                git config --global --unset https.proxy 2>$null
                git config --global --unset-all http.proxy 2>$null
                git config --global --unset-all https.proxy 2>$null
                Write-Host "代理已永久禁用" -ForegroundColor Green
            }
            "3" {
                $newProxy = Read-Host "请输入新的代理地址 (格式: http://host:port)"
                git config --global http.proxy $newProxy
                git config --global https.proxy $newProxy
                Write-Host "代理已重新配置为: $newProxy" -ForegroundColor Green
            }
            "4" {
                Write-Host "跳过代理修复" -ForegroundColor Yellow
            }
            default {
                Write-Host "无效选择，跳过修复" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "未发现代理配置" -ForegroundColor Green
}

Write-Host ""

# 4. 测试Git连接
Write-Host "4. 测试Git连接..." -ForegroundColor Yellow
try {
    $testResult = git ls-remote origin 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Git连接测试成功！" -ForegroundColor Green
        Write-Host "远程分支信息:"
        $testResult | Select-Object -First 3
    } else {
        Write-Host "Git连接测试失败:" -ForegroundColor Red
        Write-Host $testResult -ForegroundColor Red
        
        # 提供其他解决方案
        Write-Host ""
        Write-Host "=== 其他解决方案 ===" -ForegroundColor Yellow
        Write-Host "1. 尝试切换到SSH协议"
        Write-Host "2. 修改DNS设置"
        Write-Host "3. 检查防火墙设置"
        Write-Host "4. 使用GitHub CLI"
    }
} catch {
    Write-Host "Git连接测试出错: $_" -ForegroundColor Red
}

Write-Host ""

# 5. 提供常用修复命令
Write-Host "=== 常用修复命令 ===" -ForegroundColor Green
Write-Host "禁用代理: git config --global --unset https.proxy"
Write-Host "设置代理: git config --global https.proxy http://proxy:port"
Write-Host "切换到SSH: git remote set-url origin git@github.com:username/repo.git"
Write-Host "重置Git配置: git config --global --unset-all http.proxy"
Write-Host ""

Write-Host "脚本执行完成！" -ForegroundColor Green
Write-Host "如果问题仍然存在，请检查网络连接或联系网络管理员。" -ForegroundColor Cyan