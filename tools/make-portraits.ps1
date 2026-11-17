# Sanctuary: Echoes of Self — portrait asset extraction
#
# The only anime illustrations available for this project are the three
# reference sheets supplied by the author, so the individual character
# portraits are cropped from those sheets instead of being redrawn.
# Requires Windows PowerShell (uses the WIC WebP decoder, no external tools).
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools/make-portraits.ps1
#
# Coordinates are in pixels of the sheet as supplied (1227x1282 and 1536x1024).

param(
  [string]$OutDir = "assets/portraits",
  [string]$ContactPath = ".tmp-crops/contact.png"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sheets = @{
  main  = Join-Path $root ".cloud-attachments/248b579abc2fa3a001870f6528348c3cb4d032c744e58a4187dfa882b7b200c7.webp"
  lineup = Join-Path $root ".cloud-attachments/cf45f3d4d0e8988e2626be2d110d71407e635f191bacbc6d4663aa6fb959d445.webp"
  style = Join-Path $root ".cloud-attachments/f39988447a762e09b82cd97ca2ab3b21a49ba70c16cc33ff5e4a15c4dfc41683.webp"
}

function Get-Frame([string]$path) {
  $stream = [System.IO.File]::OpenRead($path)
  $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
    $stream,
    [System.Windows.Media.Imaging.BitmapCreateOptions]::None,
    [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
  $frame = $decoder.Frames[0]
  $stream.Close()
  return $frame
}

function Save-Crop($frame, [int]$x, [int]$y, [int]$w, [int]$h, [string]$dst) {
  $pw = [int]$frame.PixelWidth; $ph = [int]$frame.PixelHeight
  if ($x -lt 0) { $w += $x; $x = 0 }
  if ($y -lt 0) { $h += $y; $y = 0 }
  if (($x + $w) -gt $pw) { $w = $pw - $x }
  if (($y + $h) -gt $ph) { $h = $ph - $y }
  $rect = New-Object System.Windows.Int32Rect($x, $y, $w, $h)
  $crop = New-Object System.Windows.Media.Imaging.CroppedBitmap($frame, $rect)
  $dir = Split-Path -Parent $dst
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($crop))
  $file = [System.IO.File]::Create($dst)
  $encoder.Save($file)
  $file.Close()
  return $dst
}

# --- crop table ------------------------------------------------------------
# Inset each card a little so the printed frame line of the sheet is dropped.
$crops = @(
  # main character — expression panel of the Main Character Reference
  # rows sit at y 130 / 325 / 520, each cell 175 tall with its caption below
  @{ sheet = "main"; id = "player"; mood = "neutral";     x = 795;  y = 130; w = 200; h = 172 }
  @{ sheet = "main"; id = "player"; mood = "happy";       x = 1015; y = 130; w = 200; h = 172 }
  @{ sheet = "main"; id = "player"; mood = "sad";         x = 795;  y = 338; w = 200; h = 158 }
  @{ sheet = "main"; id = "player"; mood = "surprised";   x = 1015; y = 338; w = 200; h = 158 }
  @{ sheet = "main"; id = "player"; mood = "embarrassed"; x = 795;  y = 533; w = 200; h = 158 }
  @{ sheet = "main"; id = "player"; mood = "thinking";    x = 1015; y = 533; w = 200; h = 158 }
  @{ sheet = "main"; id = "player"; mood = "angry";       x = 615;  y = 700; w = 190; h = 180 }

  # nine NPCs — NPC Lineup Reference; centres from the name plaques
  @{ sheet = "lineup"; id = "nyssa";  mood = "neutral"; x = 80;  y = 120; w = 240; h = 328 }
  @{ sheet = "lineup"; id = "liora";  mood = "neutral"; x = 382; y = 120; w = 240; h = 328 }
  @{ sheet = "lineup"; id = "elowen"; mood = "neutral"; x = 674; y = 120; w = 240; h = 328 }
  @{ sheet = "lineup"; id = "rowan";  mood = "neutral"; x = 969; y = 120; w = 240; h = 328 }
  @{ sheet = "lineup"; id = "mira";   mood = "neutral"; x = 1255; y = 120; w = 240; h = 328 }
  @{ sheet = "lineup"; id = "celeste"; mood = "neutral"; x = 128; y = 615; w = 240; h = 268 }
  @{ sheet = "lineup"; id = "theo";   mood = "neutral"; x = 436; y = 615; w = 240; h = 268 }
  @{ sheet = "lineup"; id = "aria";   mood = "neutral"; x = 796; y = 615; w = 240; h = 268 }
  @{ sheet = "lineup"; id = "finn";   mood = "neutral"; x = 1214; y = 615; w = 240; h = 268 }
)

$frames = @{}
foreach ($key in $sheets.Keys) { $frames[$key] = Get-Frame $sheets[$key] }

$made = @()
foreach ($c in $crops) {
  $dst = Join-Path (Join-Path $OutDir $c.id) ($c.mood + ".png")
  $made += Save-Crop $frames[$c.sheet] $c.x $c.y $c.w $c.h (Join-Path $root $dst)
}

Write-Output ("cropped " + $made.Count + " portraits")

# --- contact sheet so the framing can be checked at a glance ---------------
$contactDir = Split-Path -Parent (Join-Path $root $ContactPath)
if (-not (Test-Path $contactDir)) { New-Item -ItemType Directory -Path $contactDir -Force | Out-Null }
$cellW = 200; $cellH = 240; $cols = 5
$rows = [math]::Ceiling($made.Count / $cols)
$sheet = New-Object System.Drawing.Bitmap(($cellW * $cols), ($cellH * $rows))
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::FromArgb(255, 34, 28, 43))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$i = 0
foreach ($p in $made) {
  $img = [System.Drawing.Image]::FromFile($p)
  $scale = [math]::Min(($cellW - 8) / $img.Width, ($cellH - 26) / $img.Height)
  $dw = [int]($img.Width * $scale); $dh = [int]($img.Height * $scale)
  $cx = ($i % $cols) * $cellW; $cy = [math]::Floor($i / $cols) * $cellH
  $g.DrawImage($img, ($cx + (($cellW - $dw) / 2)), ($cy + 4), $dw, $dh)
  $label = (Split-Path -Leaf (Split-Path -Parent $p)) + " " + [System.IO.Path]::GetFileNameWithoutExtension($p)
  $g.DrawString($label, (New-Object System.Drawing.Font("Segoe UI", 8)), [System.Drawing.Brushes]::White, ($cx + 4), ($cy + $dh + 6))
  $img.Dispose()
  $i++
}
$g.Dispose()
$sheet.Save((Join-Path $root $ContactPath), [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()
Write-Output ("contact sheet -> " + $ContactPath)
