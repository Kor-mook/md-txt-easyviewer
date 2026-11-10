param([switch]$NoPause)
$ErrorActionPreference = 'Stop'
try {
    $source = $PSScriptRoot
    $destination = Join-Path $env:LOCALAPPDATA 'Programs\MDTXEasyViewer'
    $exe = Join-Path $destination 'MarkdownViewer.exe'
    $required = @('MarkdownViewer.exe','index.html','math-renderer.js','app-icon.ico','사용법.txt')
    foreach ($file in $required) { if (-not (Test-Path -LiteralPath (Join-Path $source $file) -PathType Leaf)) { throw "설치 파일이 없습니다: $file" } }
    if (-not (Test-Path -LiteralPath (Join-Path $source 'locales\en.json') -PathType Leaf) -or -not (Test-Path -LiteralPath (Join-Path $source 'locales\ko.json') -PathType Leaf)) { throw '언어 파일이 없습니다.' }
    $running = Get-CimInstance Win32_Process -Filter "Name = 'MarkdownViewer.exe'" | Where-Object { $_.ExecutablePath -eq $exe }
    if ($running) { throw '설치된 MD/TXT EasyViewer를 모두 종료한 후 다시 실행해 주세요.' }
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    foreach ($file in $required) { Copy-Item -LiteralPath (Join-Path $source $file) -Destination (Join-Path $destination $file) -Force }
    New-Item -ItemType Directory -Path (Join-Path $destination 'locales') -Force | Out-Null
    Get-ChildItem -LiteralPath (Join-Path $source 'locales') -Filter '*.json' -File | ForEach-Object { $target = Join-Path (Join-Path $destination 'locales') $_.Name; if (-not (Test-Path -LiteralPath $target)) { Copy-Item -LiteralPath $_.FullName -Destination $target } }
    $name = 'MD/TXT EasyViewer'
    $progId = 'MDTXEasyViewer.Document'
    $classes = 'HKCU:\Software\Classes'
    $app = Join-Path $classes 'Applications\MarkdownViewer.exe'
    $program = Join-Path $classes $progId
    $capability = 'HKCU:\Software\MDTXEasyViewer\Capabilities'
    foreach ($key in @($app, "$app\DefaultIcon", "$app\shell\open\command", "$app\SupportedTypes", $program, "$program\DefaultIcon", "$program\shell\open\command", $capability, "$capability\FileAssociations", 'HKCU:\Software\RegisteredApplications')) { New-Item -Path $key -Force | Out-Null }
    Set-ItemProperty -Path $app -Name FriendlyAppName -Value $name
    Set-ItemProperty -Path $app -Name ApplicationDescription -Value 'Markdown and text file viewer'
    Set-Item -Path "$app\DefaultIcon" -Value ('"' + $exe + '",0')
    $command = '"' + $exe + '" "%1"'
    Set-Item -Path "$app\shell\open\command" -Value $command
    Set-Item -Path $program -Value $name
    Set-ItemProperty -Path $program -Name FriendlyTypeName -Value $name
    Set-Item -Path "$program\DefaultIcon" -Value ('"' + $exe + '",0')
    Set-Item -Path "$program\shell\open\command" -Value $command
    Set-ItemProperty -Path $capability -Name ApplicationName -Value $name
    Set-ItemProperty -Path $capability -Name ApplicationDescription -Value 'Markdown and text file viewer'
    Set-ItemProperty -Path 'HKCU:\Software\RegisteredApplications' -Name 'MDTXT EasyViewer' -Value 'Software\MDTXEasyViewer\Capabilities'
    foreach ($extension in @('.md','.markdown','.mdown','.txt')) {
        New-ItemProperty -Path "$app\SupportedTypes" -Name $extension -Value '' -PropertyType String -Force | Out-Null
        New-ItemProperty -Path "$capability\FileAssociations" -Name $extension -Value $progId -PropertyType String -Force | Out-Null
        $openWith = Join-Path $classes "$extension\OpenWithProgids"
        New-Item -Path $openWith -Force | Out-Null
        New-ItemProperty -Path $openWith -Name $progId -Value '' -PropertyType String -Force | Out-Null
    }
    $shortcutPath = Join-Path ([Environment]::GetFolderPath('Programs')) 'MD TXT EasyViewer.lnk'
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $exe
    $shortcut.WorkingDirectory = $destination
    $shortcut.IconLocation = "$exe,0"
    $shortcut.Description = $name
    $shortcut.Save()
    Write-Host "설치 완료: $destination"
    Write-Host 'Windows 설정 > 앱 > 기본 앱에서 MD/TXT EasyViewer를 선택할 수 있습니다.'
} catch { Write-Host $_ -ForegroundColor Red; if (-not $NoPause) { Read-Host 'Enter 키를 눌러 종료' }; exit 1 }
if (-not $NoPause) { Read-Host 'Enter 키를 눌러 종료' }
