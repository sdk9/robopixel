param(
  [string]$AsepritePath = "C:\Program Files (x86)\Steam\steamapps\common\Aseprite\Aseprite.exe"
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$sourceRoot = Join-Path $projectRoot "art\robots"
$publicRoot = Join-Path $projectRoot "public\images\robots"
$generator = Join-Path $projectRoot "art\build-robots.lua"
$requiredSheets = @(
  "arm-base.png",
  "scara-head.png",
  "delta-frame.png",
  "gantry-rail.png",
  "humanoid-walk.png",
  "cobot-base.png",
  "amr-top.png"
)

if (-not (Test-Path -LiteralPath $AsepritePath)) {
  throw "Aseprite was not found at: $AsepritePath"
}

New-Item -ItemType Directory -Force -Path $sourceRoot, $publicRoot | Out-Null
$asepriteSource = $sourceRoot.Replace("\", "/")
$asepritePublic = $publicRoot.Replace("\", "/")

& $AsepritePath --batch --script-param "src=$asepriteSource" --script-param "png=$asepritePublic" --script $generator
Start-Sleep -Milliseconds 400

foreach ($sheet in $requiredSheets) {
  if (-not (Test-Path -LiteralPath (Join-Path $publicRoot $sheet))) {
    throw "Aseprite did not create the required sheet: $sheet"
  }
}

Write-Host "Generated editable Aseprite sources and browser sprite sheets for all 7 robot labs."
