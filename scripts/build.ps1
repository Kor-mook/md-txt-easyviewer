param()
$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$output = Join-Path $project 'build'
$viewerOutput = Join-Path $output 'viewer'
$source = Join-Path $project 'src\viewer'
$installer = Join-Path $project 'src\installer'
$icon = Join-Path $project 'assets\app-icon.ico'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $compiler)) { throw '.NET Framework 4.x C# compiler not found.' }
New-Item -ItemType Directory -Path $viewerOutput,(Join-Path $viewerOutput 'locales') -Force | Out-Null
& $compiler /nologo /target:winexe "/win32icon:$icon" "/out:$viewerOutput\MarkdownViewer.exe" /reference:System.Windows.Forms.dll /reference:System.Web.Extensions.dll /reference:System.Data.dll /reference:System.Management.dll (Join-Path $source 'MarkdownViewer.cs')
if ($LASTEXITCODE -ne 0) { throw 'Viewer compilation failed.' }
foreach ($name in @('index.html','math-renderer.js')) { Copy-Item -LiteralPath (Join-Path $source $name) -Destination $viewerOutput -Force }
Copy-Item -LiteralPath $icon -Destination $viewerOutput -Force
Copy-Item -LiteralPath (Join-Path $project '사용법.txt') -Destination $viewerOutput -Force
Copy-Item -LiteralPath (Join-Path $installer 'install.ps1'),(Join-Path $installer 'install.cmd') -Destination $viewerOutput -Force
Get-ChildItem -LiteralPath (Join-Path $source 'locales') -Filter '*.json' -File | Copy-Item -Destination (Join-Path $viewerOutput 'locales') -Force
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$payload = Join-Path $output ('payload-' + [Guid]::NewGuid().ToString('N') + '.zip')
try {
    $archive = [IO.Compression.ZipFile]::Open($payload, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($name in @('MarkdownViewer.exe','index.html','math-renderer.js','app-icon.ico','사용법.txt','install.ps1','install.cmd')) {
            [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $viewerOutput $name), $name, [IO.Compression.CompressionLevel]::Optimal)
        }
        foreach ($file in Get-ChildItem -LiteralPath (Join-Path $source 'locales') -Filter '*.json' -File) {
            [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, ('locales/' + $file.Name), [IO.Compression.CompressionLevel]::Optimal)
        }
    } finally { $archive.Dispose() }
    $setup = Join-Path $output 'MD-TXT-EasyViewer-Setup.exe'
    & $compiler /nologo /target:winexe "/win32icon:$icon" "/out:$setup" "/resource:$payload,payload.zip" /reference:System.Windows.Forms.dll /reference:System.IO.Compression.dll (Join-Path $installer 'Installer.cs')
    if ($LASTEXITCODE -ne 0) { throw 'Installer compilation failed.' }
    Write-Host "Viewer: $viewerOutput\MarkdownViewer.exe"
    Write-Host "Installer: $setup"
} finally {
    if (Test-Path -LiteralPath $payload) { Remove-Item -LiteralPath $payload -Force }
}
