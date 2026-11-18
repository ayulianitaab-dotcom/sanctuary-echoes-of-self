<?php
/**
 * Builds the official NPC portraits from the supplied NPC Lineup Reference.
 *
 * The lineup is a single row of nine full-body cards. Each card is located by
 * the purple name plaque underneath it, then one fixed bust window is cut from
 * every card, so all nine portraits share the same framing, scale and aspect.
 * The artwork is never redrawn, recoloured or retouched.
 *
 * The supplied lineup contains one neutral pose per character, so that is the
 * only portrait produced here. Additional moods are written into the same
 * folder by this script as soon as an expression sheet is available.
 *
 *   php tools/build-npc-assets.php
 */
require_once __DIR__ . '/lib/image-pipeline.php';

$root = dirname(__DIR__);
$sheetPath = $root . '/assets/characters/npc/source-lineup.webp';
$outRoot = $root . '/assets/portraits';
$debugDir = $root . '/.tmp-npc-assets';

$sheet = @imagecreatefromwebp($sheetPath);
if (!$sheet) {
    fwrite(STDERR, "cannot read $sheetPath\n");
    exit(1);
}
imagealphablending($sheet, false);
$W = imagesx($sheet);
$H = imagesy($sheet);

/* ---------------- locate the nine cards from their name plaques ---------------- */
$plaqueTop = (int)round($H * 0.720);
$plaqueBottom = (int)round($H * 0.780);
$purple = [];
for ($x = 0; $x < $W; $x++) {
    $hits = 0;
    for ($y = $plaqueTop; $y <= $plaqueBottom; $y++) {
        $c = imagecolorat($sheet, $x, $y);
        $r = ($c >> 16) & 255;
        $g = ($c >> 8) & 255;
        $b = $c & 255;
        if ($b > $g + 18 && $r > $g + 5 && $b > 110 && $g < 150) $hits++;
    }
    $purple[$x] = $hits;
}
$centers = [];
$runStart = null;
for ($x = 0; $x <= $W; $x++) {
    // the banner is only a few pixels tall, so a handful of purple rows is a hit
    $on = $x < $W && $purple[$x] >= 3;
    if ($on && $runStart === null) $runStart = $x;
    if (!$on && $runStart !== null) {
        if ($x - $runStart >= 40) $centers[] = (int)round(($runStart + $x - 1) / 2);
        $runStart = null;
    }
}
sort($centers);

$ids = ['nyssa', 'liora', 'elowen', 'rowan', 'mira', 'celeste', 'theo', 'aria', 'finn'];
if (count($centers) !== count($ids)) {
    fwrite(STDERR, 'expected ' . count($ids) . ' cards, found ' . count($centers) . " name plaques\n");
    exit(1);
}

/* ---------------- one fixed bust window for every card ---------------- */
// Measured from the sheet: cards start just below the header, faces sit in a
// single band, so one window keeps every portrait aligned without guesswork.
$cardWidth = 138;
$cropTop = (int)round($H * 0.186);    // 190 at 1024 — below the card's gold frame
$cropHeight = (int)round($H * 0.170); // 174 at 1024

// matches the dialogue portrait box (4:5), like the main character faces
$portraitW = 336;
$portraitH = 420;

if (!is_dir($debugDir)) mkdir($debugDir, 0777, true);

$made = [];
foreach ($ids as $i => $id) {
    $cx = $centers[$i];
    $x0 = max(0, $cx - (int)($cardWidth / 2));
    $y0 = $cropTop;
    $w = min($cardWidth, $W - $x0);
    $h = min($cropHeight, $H - $y0);

    $src = imagecreatetruecolor($w, $h);
    imagecopy($src, $sheet, 0, 0, $x0, $y0, $w, $h);
    $art = fitCover($src, $portraitW, $portraitH);

    $dir = $outRoot . '/' . $id;
    if (!is_dir($dir)) mkdir($dir, 0777, true);
    $png = $dir . '/neutral.png';
    imagepng($art, $png, 9);

    // drop the superseded lossless webp so the build embeds each mood once
    $stale = $dir . '/neutral.webp';
    if (is_file($stale)) unlink($stale);

    $made[] = $png;
    echo sprintf("%s/neutral.png  %dx%d  from %dx%d at (%d,%d)\n", $id, $portraitW, $portraitH, $w, $h, $x0, $y0);
}

/* ---------------- inspection sheet ---------------- */
$cell = 260;
$cols = 5;
$rows = (int)ceil(count($made) / $cols) + 1;
$dbg = imagecreatetruecolor($cell * $cols, $cell * $rows);
imagealphablending($dbg, true);
imagefill($dbg, 0, 0, imagecolorallocate($dbg, 150, 132, 178));
$k = 0;
foreach ($made as $f) {
    $im = imagecreatefrompng($f);
    $x = ($k % $cols) * $cell;
    $y = (int)floor($k / $cols) * $cell;
    imagecopyresampled($dbg, $im, $x + 6, $y + 6, 0, 0, $cell - 12, $cell - 12, imagesx($im), imagesy($im));
    imagestring($dbg, 3, $x + 10, $y + 10, basename(dirname($f)), imagecolorallocate($dbg, 20, 10, 30));
    $k++;
}
imagepng($dbg, $debugDir . '/contact-sheet.png', 6);
echo "debug sheet: .tmp-npc-assets/contact-sheet.png\n";
echo 'portraits: ' . count($made) . "\n";
