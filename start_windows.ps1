# PowerShell script untuk menjalankan bot di background
# Bisa dijalankan sebagai normal user (tidak butuh admin)

Write-Host "Starting Crypto Alerts Bot in background..." -ForegroundColor Green
Write-Host "Bot akan terus jalan meskipun terminal ditutup." -ForegroundColor Yellow
Write-Host ""

# Setup log directory
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Start bot in background and redirect output to logs
$job = Start-Job -ScriptBlock {
    $path = $args[0]
    Set-Location $path
    node index.js
} -ArgumentList (Get-Location).Path

Write-Host "✅ Bot started in background as Job ID: $($job.Id)" -ForegroundColor Green
Write-Host ""
Write-Host "Commands untuk mengelola bot:" -ForegroundColor Cyan
Write-Host "  .\manage_bot.ps1 status     - Cek status bot" -ForegroundColor White
Write-Host "  .\manage_bot.ps1 logs       - Lihat logs" -ForegroundColor White
Write-Host "  .\manage_bot.ps1 stop       - Stop bot" -ForegroundColor White
Write-Host "  .\manage_bot.ps1 restart    - Restart bot" -ForegroundColor White
Write-Host ""
Write-Host "Atau gunakan PowerShell commands:" -ForegroundColor Cyan
Write-Host "  Get-Job                      - Lihat semua background jobs" -ForegroundColor White
Write-Host "  Receive-Job -Id $($job.Id)    - Lihat output" -ForegroundColor White
Write-Host "  Stop-Job -Id $($job.Id)      - Stop bot" -ForegroundColor White
Write-Host "  Remove-Job -Id $($job.Id)    - Hapus job" -ForegroundColor White
