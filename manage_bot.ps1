# PowerShell script untuk mengelola bot yang running di background

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("status", "logs", "stop", "restart", "kill")]
    [string]$Action
)

$botName = "CryptoAlertsBot"

function Get-BotJob {
    Get-Job | Where-Object { $_.Name -like "*node*" -or $_.Command -like "*index.js*" }
}

function Show-Status {
    Write-Host "=== Crypto Alerts Bot Status ===" -ForegroundColor Cyan
    $jobs = Get-BotJob
    
    if ($jobs) {
        foreach ($job in $jobs) {
            Write-Host "Job ID: $($job.Id)" -ForegroundColor Green
            Write-Host "Status: $($job.State)" -ForegroundColor Yellow
            Write-Host "Started: $($job.PSBeginTime)" -ForegroundColor White
            Write-Host "Command: $($job.Command)" -ForegroundColor Gray
            Write-Host ""
        }
        Write-Host "Total running jobs: $($jobs.Count)" -ForegroundColor Green
    } else {
        Write-Host "❌ Bot tidak sedang running" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host "=== Bot Logs ===" -ForegroundColor Cyan
    $jobs = Get-BotJob
    
    if ($jobs) {
        foreach ($job in $jobs) {
            Write-Host "Job ID: $($job.Id)" -ForegroundColor Green
            Write-Host "Recent output:" -ForegroundColor Yellow
            Receive-Job -Id $job.Id -Keep | Select-Object -Last 20
        }
    } else {
        Write-Host "❌ Bot tidak sedang running" -ForegroundColor Red
    }
}

function Stop-Bot {
    Write-Host "=== Stopping Bot ===" -ForegroundColor Cyan
    $jobs = Get-BotJob
    
    if ($jobs) {
        foreach ($job in $jobs) {
            Write-Host "Stopping Job ID: $($job.Id)..." -ForegroundColor Yellow
            Stop-Job -Id $job.Id
            Remove-Job -Id $job.Id -Force
            Write-Host "✅ Job ID $($job.Id) stopped" -ForegroundColor Green
        }
        Write-Host "✅ Bot berhasil di-stop" -ForegroundColor Green
    } else {
        Write-Host "❌ Bot tidak sedang running" -ForegroundColor Red
    }
}

function Restart-Bot {
    Write-Host "=== Restarting Bot ===" -ForegroundColor Cyan
    
    # Stop existing
    $jobs = Get-BotJob
    if ($jobs) {
        Write-Host "Stopping existing bot..." -ForegroundColor Yellow
        foreach ($job in $jobs) {
            Stop-Job -Id $job.Id
            Remove-Job -Id $job.Id -Force
        }
    }
    
    # Start new
    Write-Host "Starting new bot..." -ForegroundColor Yellow
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    $job = Start-Job -ScriptBlock {
        $path = $args[0]
        Set-Location $path
        node index.js
    } -ArgumentList (Get-Location).Path
    
    Write-Host "✅ Bot restarted as Job ID: $($job.Id)" -ForegroundColor Green
}

function Kill-Bot {
    Write-Host "=== Force Killing Bot ===" -ForegroundColor Cyan
    Write-Host "WARNING: Ini akan kill semua node.exe processes!" -ForegroundColor Red
    
    $confirm = Read-Host "Are you sure? (yes/no)"
    if ($confirm -eq "yes") {
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        Write-Host "✅ All node processes killed" -ForegroundColor Green
    } else {
        Write-Host "Cancelled" -ForegroundColor Yellow
    }
}

# Execute action
switch ($Action) {
    "status" { Show-Status }
    "logs" { Show-Logs }
    "stop" { Stop-Bot }
    "restart" { Restart-Bot }
    "kill" { Kill-Bot }
}
